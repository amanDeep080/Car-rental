package com.velocira.repository;

import com.velocira.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CouponUsageRepository extends JpaRepository<CouponUsage, UUID> {
    long countByCouponId(UUID couponId);
    long countByCouponIdAndUserId(UUID couponId, UUID userId);
}
