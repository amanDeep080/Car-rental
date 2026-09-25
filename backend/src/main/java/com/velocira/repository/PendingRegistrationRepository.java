package com.velocira.repository;

import com.velocira.entity.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, UUID> {
    Optional<PendingRegistration> findByEmailIgnoreCase(String email);
    Optional<PendingRegistration> findByEmailIgnoreCaseAndOtp(String email, String otp);
    void deleteByEmailIgnoreCase(String email);
}
