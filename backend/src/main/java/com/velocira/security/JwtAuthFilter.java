package com.velocira.security;

import com.velocira.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        log.debug("JWT: Processing token for path: {}", request.getRequestURI());

        try {
            if (jwtService.isValid(token)) {
                Claims claims = jwtService.parseClaims(token);

                if ("access".equals(claims.get("type"))) {
                    UUID userId = UUID.fromString(claims.getSubject());
                    userRepository.findById(userId).ifPresent(user -> {
                        UserPrincipal principal = new UserPrincipal(user);
                        var authorities = principal.getAuthorities();
                        log.info("JWT Auth SUCCESS: {} (Authorities: {})", user.getEmail(), authorities);
                        var authToken = new UsernamePasswordAuthenticationToken(
                            principal, null, authorities
                        );
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    });
                } else {
                    log.warn("JWT Auth FAIL: Token type is {}, expected 'access'", claims.get("type"));
                }
            } else {
                log.warn("JWT Auth FAIL: Invalid or expired token for path {}", request.getRequestURI());
            }
        } catch (Exception e) {
            log.error("JWT Auth ERROR for path {}: {}", request.getRequestURI(), e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
