package com.velocira.dto.coupon;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.Instant;

public record CouponUpsertRequest(
    @NotBlank String code,
    @NotBlank String discountType, // PERCENTAGE or FIXED
    @NotNull @Positive BigDecimal discountValue,
    BigDecimal minBookingAmount,
    BigDecimal maxDiscountAmount,
    @NotNull Instant startDate,
    @NotNull Instant endDate,
    Integer usageLimit,
    Integer userUsageLimit,
    boolean active
) {}
