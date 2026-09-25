package com.velocira.repository;

import com.velocira.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findAllByBookingId(UUID bookingId);
    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);
    Optional<Payment> findFirstByBookingIdOrderByCreatedAtDesc(UUID bookingId);
}
