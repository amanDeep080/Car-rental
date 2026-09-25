package com.velocira.config;

import com.velocira.security.AbuseRateLimitFilter;
import com.velocira.security.JwtAuthFilter;
import com.velocira.security.PresenceFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // enables @PreAuthorize("hasRole('ADMIN')") on controllers/services
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AbuseRateLimitFilter abuseRateLimitFilter;
    private final PresenceFilter presenceFilter;
    private final UserDetailsService userDetailsService;
    private final CorsProperties corsProperties;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // stateless JWT API — no cookie-based session to protect
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers
                .contentTypeOptions(opts -> {})
                .frameOptions(frame -> frame.deny())
                // HSTS: only takes effect once traffic is actually served over
                // HTTPS (typically terminated at a reverse proxy/CDN in front
                // of this container) — harmless to set unconditionally, and
                // means it's on by default the moment TLS termination is added
                // rather than something someone has to remember to enable later.
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(TimeUnit.DAYS.toSeconds(365))
                )
                .referrerPolicy(referrer -> referrer
                    .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                )
            )
            .authorizeHttpRequests(auth -> auth
                // Allow all preflight OPTIONS requests
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                // Public — browsing and auth do not require a token
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/cars/**").permitAll()
                .requestMatchers("/api/locations/**").permitAll()
                .requestMatchers("/api/addons/**").permitAll()
                .requestMatchers("/api/ai/**").permitAll()
                .requestMatchers("/api/payments/webhook").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/ws/**").permitAll()

                // Admin-only surface — enforced here at the gateway AND again
                // with @PreAuthorize on individual service methods (defense
                // in depth, spec §52 "backend authorization, not only
                // frontend hiding").
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")

                // Everything else requires an authenticated customer/admin
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            // Rate limiter runs before the JWT filter — login/register/
            // forgot-password have no token to check yet anyway, and we
            // want to reject abusive traffic as early as possible. Chained
            // relative to jwtAuthFilter (not both independently placed
            // before UsernamePasswordAuthenticationFilter) so the ordering
            // between the two is explicit rather than left ambiguous.
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(abuseRateLimitFilter, JwtAuthFilter.class)
            .addFilterAfter(presenceFilter, JwtAuthFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(corsProperties.allowedOrigins().split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
