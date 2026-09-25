package com.velocira.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SecurityStartupChecks implements ApplicationRunner {

    private static final String INSECURE_DEFAULT = "CHANGE_ME_IN_ENV_MIN_32_BYTES_LONG_SECRET";
    private static final int MIN_SECRET_BYTES = 32; // HS256 wants a key >= 256 bits

    private final JwtProperties jwtProperties;

    @Override
    public void run(ApplicationArguments args) {
        String secret = jwtProperties.secret();

        if (INSECURE_DEFAULT.equals(secret)) {
            log.warn("=".repeat(72));
            log.warn("SECURITY WARNING: JWT_SECRET is still the insecure placeholder default.");
            log.warn("Every token this instance issues is forgeable by anyone who reads this");
            log.warn("source code. Set a real JWT_SECRET before this is reachable by anyone");
            log.warn("other than you on localhost. Generate one with: openssl rand -base64 48");
            log.warn("=".repeat(72));
        } else if (secret == null || secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < MIN_SECRET_BYTES) {
            log.warn("SECURITY WARNING: JWT_SECRET is shorter than the recommended {} bytes — "
                + "this weakens the HMAC signature and makes tokens easier to forge.", MIN_SECRET_BYTES);
        }
    }
}
