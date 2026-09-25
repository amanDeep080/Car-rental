package com.velocira.dto.coupon;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CouponResponse(
    UUID id,
    String code,
    String discountType,
    BigDecimal discountValue,
    BigDecimal minBookingAmount,
    BigDecimal maxDiscountAmount,
    Instant startDate,
    Instant endDate,
    Integer usageLimit,
    Integer userUsageLimit,
    boolean active
) {}
