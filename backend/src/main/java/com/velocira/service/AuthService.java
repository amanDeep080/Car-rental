package com.velocira.service;

import com.velocira.dto.auth.*;
import com.velocira.entity.*;
import com.velocira.repository.*;
import com.velocira.security.JwtService;
import com.velocira.service.notification.BrevoEmailService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final LiveNotificationService liveNotificationService;
    private final AuditLogService auditLogService;
    private final BrevoEmailService brevoEmailService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int RESET_TOKEN_TTL_MINUTES = 30;
    private static final int OTP_TTL_MINUTES = 10;

    @Transactional
    public void register(RegisterRequest req) {
        if (!req.password().equals(req.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match.");
        }
        if (userRepository.existsByEmailIgnoreCase(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        // Generate OTP
        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));

        // Save to temporary table
        PendingRegistration pending = pendingRegistrationRepository.findByEmailIgnoreCase(req.email())
            .orElse(new PendingRegistration());
        
        pending.setEmail(req.email().toLowerCase());
        pending.setFullName(req.fullName());
        pending.setPhone(req.phone());
        pending.setPasswordHash(passwordEncoder.encode(req.password()));
        pending.setDateOfBirth(req.dateOfBirth());
        pending.setOtp(otp);
        pending.setExpiresAt(Instant.now().plus(OTP_TTL_MINUTES, ChronoUnit.MINUTES));
        
        pendingRegistrationRepository.save(pending);

        // Send OTP via Brevo
        brevoEmailService.sendOtpEmail(pending.getEmail(), pending.getFullName(), otp);

        log.info("Registration initiated for {}. OTP sent.", pending.getEmail());
    }

    @Transactional
    public void verifyEmailAndCreateAccount(String email, String otp) {
        PendingRegistration pending = pendingRegistrationRepository.findByEmailIgnoreCaseAndOtp(email, otp)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired verification code."));

        if (pending.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification code has expired.");
        }

        // Create the actual user account
        Role customerRole = roleRepository.findByName("CUSTOMER")
            .orElseGet(() -> roleRepository.save(new Role("CUSTOMER")));

        User user = new User();
        user.setFullName(pending.getFullName());
        user.setEmail(pending.getEmail());
        user.setPhone(pending.getPhone());
        user.setPasswordHash(pending.getPasswordHash());
        user.setDateOfBirth(pending.getDateOfBirth());
        user.setEmailVerified(true);
        user.setActive(true);
        Set<Role> roles = new HashSet<>();
        roles.add(customerRole);
        user.setRoles(roles);

        User saved = userRepository.save(user);

        // Cleanup pending record
        pendingRegistrationRepository.delete(pending);

        liveNotificationService.notifyAccountCreated(saved.getEmail(), saved.getFullName());
        auditLogService.record("USER_REGISTERED", "USER", saved.getId().toString(), saved.getFullName(), saved.getEmail());
    }

    @Transactional
    public void resendOtp(String email) {
        PendingRegistration pending = pendingRegistrationRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration session not found. Please register again."));

        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        pending.setOtp(otp);
        pending.setExpiresAt(Instant.now().plus(OTP_TTL_MINUTES, ChronoUnit.MINUTES));
        pendingRegistrationRepository.save(pending);

        brevoEmailService.sendOtpEmail(pending.getEmail(), pending.getFullName(), otp);
        log.info("OTP resent to {}", email);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmailIgnoreCase(req.email())
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }
        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This account has been deactivated.");
        }
        liveNotificationService.notifyUserLogin(user.getEmail(), user.getFullName());
        auditLogService.record("USER_LOGIN", "USER", user.getId().toString(), user.getFullName(), user.getEmail());
        return issueTokens(user);
    }

    public AuthResponse refresh(RefreshRequest req) {
        if (!jwtService.isValid(req.refreshToken())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is invalid or expired.");
        }
        Claims claims = jwtService.parseClaims(req.refreshToken());
        if (!"refresh".equals(claims.get("type"))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not a refresh token.");
        }
        UUID userId = UUID.fromString(claims.getSubject());
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account no longer exists."));
        return issueTokens(user);
    }

    /**
     * Always responds as if it succeeded, whether or not the email exists —
     * revealing "no account with that email" here is a user-enumeration
     * leak. If the account exists, emails a one-time reset link; the raw
     * token is only ever in that email and the requester's browser, never
     * persisted (only its SHA-256 hash is stored, same principle as never
     * storing plaintext passwords).
     */
    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        userRepository.findByEmailIgnoreCase(req.email()).ifPresent(user -> {
            String rawToken = generateRawToken();
            PasswordResetToken token = new PasswordResetToken();
            token.setUser(user);
            token.setTokenHash(hash(rawToken));
            token.setExpiresAt(Instant.now().plus(RESET_TOKEN_TTL_MINUTES, ChronoUnit.MINUTES));
            resetTokenRepository.save(token);

            String resetLink = frontendUrl.replaceAll("/$", "") + "/reset-password?token=" + rawToken;
            brevoEmailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        String tokenHash = hash(req.token());
        PasswordResetToken token = resetTokenRepository.findByTokenHash(tokenHash)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "This reset link is invalid."));

        if (token.getUsedAt() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This reset link has already been used.");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This reset link has expired. Please request a new one.");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);

        token.setUsedAt(Instant.now());
        resetTokenRepository.save(token);
    }

    @Transactional
    public void recordLogout(UUID userId, String name, String email) {
        liveNotificationService.broadcast("LOGOUT", "User Logged Out", name + " (" + email + ") signed out.");
        auditLogService.record("USER_LOGOUT", "USER", userId.toString(), name, email);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hashBytes);
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private AuthResponse issueTokens(User user) {
        List<String> roleNames = user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        String access = jwtService.generateAccessToken(user.getId(), user.getEmail(), roleNames);
        String refresh = jwtService.generateRefreshToken(user.getId());
        return new AuthResponse(user.getId(), user.getFullName(), user.getEmail(), roleNames, access, refresh);
    }
}
