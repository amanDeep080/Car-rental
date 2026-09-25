package com.velocira.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
public class Coupon extends BaseEntity {

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    // PERCENTAGE or FIXED
    @Column(nullable = false, length = 20)
    private String discountType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    private BigDecimal minBookingAmount;
    private BigDecimal maxDiscountAmount;

    @Column(nullable = false)
    private Instant startDate;

    @Column(nullable = false)
    private Instant endDate;

    private Integer usageLimit;         // total redemptions across all users, null = unlimited
    private Integer userUsageLimit = 1; // redemptions per user

    @Column(nullable = false)
    private boolean active = true;
}
