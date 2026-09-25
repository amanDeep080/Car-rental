package com.velocira.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Rate limits abuse-prone public endpoints by client IP:
 *  - login/register/forgot-password: brute-force and credential-stuffing targets
 *  - ai/recommend: unauthenticated and calls a paid external API per request,
 *    so it's also a cost-abuse vector, not just a traffic one
 *
 * Originally named AuthRateLimitFilter when it only covered auth endpoints;
 * renamed when the AI endpoint was added rather than leaving a same-shaped
 * new public endpoint unprotected right after a security audit flagged the
 * lack of rate limiting as a finding.
 *
 * NOTE: in-memory and per-instance — correct for the single-instance
 * deployment this project's docker-compose.yml runs. Replace with a shared
 * store (Redis) if ever horizontally scaled behind a load balancer.
 */
@Component
public class AbuseRateLimitFilter extends OncePerRequestFilter {

    private static final long WINDOW_MILLIS = 15 * 60 * 1000; // 15 minutes

    // Path suffix -> max attempts per window. AI recommendations get a
    // tighter limit since each call costs money against a real API key.
    private static final Map<String, Integer> LIMITS = Map.of(
        "/api/auth/login", 10,
        "/api/auth/register", 10,
        "/api/auth/forgot-password", 10,
        "/api/ai/recommend", 20
    );

    private final ConcurrentHashMap<String, Deque<Long>> attemptsByKey = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        Integer maxAttempts = LIMITS.entrySet().stream()
            .filter(e -> path.endsWith(e.getKey()))
            .map(Map.Entry::getValue)
            .findFirst()
            .orElse(null);

        if (maxAttempts == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = clientIp(request) + ":" + path;
        Deque<Long> attempts = attemptsByKey.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());
        long now = Instant.now().toEpochMilli();

        synchronized (attempts) {
            while (!attempts.isEmpty() && now - attempts.peekFirst() > WINDOW_MILLIS) {
                attempts.pollFirst();
            }
            if (attempts.size() >= maxAttempts) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write(
                    "{\"message\":\"Too many attempts. Please wait a few minutes and try again.\"}"
                );
                return;
            }
            attempts.addLast(now);
        }

        filterChain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
