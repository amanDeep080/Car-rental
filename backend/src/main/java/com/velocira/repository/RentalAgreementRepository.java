package com.velocira.repository;

import com.velocira.entity.RentalAgreement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RentalAgreementRepository extends JpaRepository<RentalAgreement, UUID> {
    Optional<RentalAgreement> findByBookingId(UUID bookingId);
}
