package com.velocira.repository;

import com.velocira.entity.EmailVerificationToken;
import com.velocira.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {
    Optional<EmailVerificationToken> findByUser(User user);
    Optional<EmailVerificationToken> findByUserEmailIgnoreCaseAndOtp(String email, String otp);
}
