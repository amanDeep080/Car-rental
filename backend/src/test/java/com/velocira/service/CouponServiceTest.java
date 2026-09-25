package com.velocira.service;

import com.velocira.entity.Coupon;
import com.velocira.repository.CouponRepository;
import com.velocira.repository.CouponUsageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock private CouponRepository couponRepository;
    @Mock private CouponUsageRepository couponUsageRepository;

    private CouponService couponService;
    private UUID userId;
    private Coupon coupon;

    @BeforeEach
    void setUp() {
        couponService = new CouponService(couponRepository, couponUsageRepository);
        userId = UUID.randomUUID();

        coupon = new Coupon();
        coupon.setId(UUID.randomUUID());
        coupon.setCode("SAVE10");
        coupon.setDiscountType("PERCENTAGE");
        coupon.setDiscountValue(new BigDecimal("10"));
        coupon.setStartDate(Instant.now().minus(1, ChronoUnit.DAYS));
        coupon.setEndDate(Instant.now().plus(30, ChronoUnit.DAYS));
        coupon.setActive(true);
    }

    @Test
    void appliesPercentageDiscountCorrectly() {
        when(couponRepository.findByCodeIgnoreCaseAndActiveTrue("SAVE10")).thenReturn(Optional.of(coupon));

        BigDecimal discount = couponService.validateAndCalculateDiscount("SAVE10", userId, new BigDecimal("2000"));

        assertEquals(0, new BigDecimal("200.00").compareTo(discount));
    }

    @Test
    void capsDiscountAtMaxDiscountAmount() {
        coupon.setMaxDiscountAmount(new BigDecimal("100"));
        when(couponRepository.findByCodeIgnoreCaseAndActiveTrue("SAVE10")).thenReturn(Optional.of(coupon));

        // 10% of 5000 = 500, but max is capped at 100
        BigDecimal discount = couponService.validateAndCalculateDiscount("SAVE10", userId, new BigDecimal("5000"));

        assertEquals(0, new BigDecimal("100").compareTo(discount));
    }

    @Test
    void appliesFixedDiscountRegardlessOfBookingAmount() {
        coupon.setDiscountType("FIXED");
        coupon.setDiscountValue(new BigDecimal("300"));
        when(couponRepository.findByCodeIgnoreCaseAndActiveTrue("SAVE10")).thenReturn(Optional.of(coupon));

        BigDecimal discount = couponService.validateAndCalculateDiscount("SAVE10", userId, new BigDecimal("10000"));

        assertEquals(0, new BigDecimal("300").compareTo(discount));
    }

    @Test
    void rejectsUnknownCouponCode() {
        when(couponRepository.findByCodeIgnoreCaseAndActiveTrue("BOGUS")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
            () -> couponService.validateAndCalculateDiscount("BOGUS", userId, new BigDecimal("1000")));
    }

    @Test
    void rejectsExpiredCoupon() {
        coupon.setStartDate(Instant.now().minus(60, ChronoUnit.DAYS));
        coupon.setEndDate(Instant.now().minus(1, ChronoUnit.DAYS));
        when(couponRepository.findByCodeIgnoreCaseAndActiveTrue("SAVE10")).thenReturn(Optional.of(coupon));

        assertThrows(ResponseStatusException.class,
            () -> couponService.validateAndCalculateDiscount("SAVE10", userId, new BigDecimal("1000")));
    }

    @Test
    void rejectsCouponNotYetStarted() {
        coupon.setStartDate(Instant.now().plus(1, ChronoUnit.DAYS));
        coupon.setEndDate(Instant.now().plus(30, ChronoUnit.DAYS));
        when(couponRepository.findByCodeIgnoreCaseAndActiveTrue("SAVE10")).thenReturn(Optional.of(coupon));

        assertThrows(ResponseStatusException.class,
            () -> couponService.validateAndCalculateDiscount("SAVE10", userId, new BigDecimal("1000")));
    }

    @Test
    void rejectsWhenBookingAmountIsBelowMinimum() {
        coupon.setMinBookingAmount(new BigDecimal("5000"));
        when(couponRepository.findByCodeIgnoreCaseAndActiveTrue("SAVE10")).thenReturn(Optional.of(coupon));

        assertThrows(ResponseStatusException.class,
            () -> couponService.validateAndCalculateDiscount("SAVE10", userId, new BigDecimal("1000")));
    }

    @Test
    void rejectsWhenGlobalUsageLimitReached() {
        coupon.setUsageLimit(5);
        when(couponRepository.findByCodeIgnoreCaseAndActiveTrue("SAVE10")).thenReturn(Optional.of(coupon));
        when(couponUsageRepository.countByCouponId(coupon.getId())).thenReturn(5L);

        assertThrows(ResponseStatusException.class,
            () -> couponService.validateAndCalculateDiscount("SAVE10", userId, new BigDecimal("1000")));
    }

    @Test
    void rejectsWhenThisUserHasAlreadyUsedTheirAllowance() {
        coupon.setUserUsageLimit(1);
        when(couponRepository.findByCodeIgnoreCaseAndActiveTrue("SAVE10")).thenReturn(Optional.of(coupon));
        when(couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), userId)).thenReturn(1L);

        assertThrows(ResponseStatusException.class,
            () -> couponService.validateAndCalculateDiscount("SAVE10", userId, new BigDecimal("1000")));
    }
}
