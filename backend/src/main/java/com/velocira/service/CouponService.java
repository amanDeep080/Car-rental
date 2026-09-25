package com.velocira.service;

import com.velocira.entity.Coupon;
import com.velocira.repository.CouponRepository;
import com.velocira.repository.CouponUsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    /** Validates the coupon against dates, usage limits, and the booking's
     *  rental amount, then returns the discount to apply. Never trust a
     *  discount amount sent from the frontend — always recompute here. */
    public BigDecimal validateAndCalculateDiscount(String code, UUID userId, BigDecimal rentalAmount) {
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndActiveTrue(code)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "This coupon code is invalid."));

        Instant now = Instant.now();
        if (now.isBefore(coupon.getStartDate()) || now.isAfter(coupon.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This coupon is not currently active.");
        }
        if (coupon.getMinBookingAmount() != null && rentalAmount.compareTo(coupon.getMinBookingAmount()) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "This booking doesn't meet the minimum amount for this coupon.");
        }
        if (coupon.getUsageLimit() != null
            && couponUsageRepository.countByCouponId(coupon.getId()) >= coupon.getUsageLimit()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This coupon has reached its usage limit.");
        }
        if (coupon.getUserUsageLimit() != null
            && couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), userId) >= coupon.getUserUsageLimit()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You've already used this coupon.");
        }

        BigDecimal discount = "PERCENTAGE".equals(coupon.getDiscountType())
            ? rentalAmount.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
            : coupon.getDiscountValue();

        if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
            discount = coupon.getMaxDiscountAmount();
        }
        return discount;
    }

    public Coupon getActiveCoupon(String code) {
        return couponRepository.findByCodeIgnoreCaseAndActiveTrue(code)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "This coupon code is invalid."));
    }
}
