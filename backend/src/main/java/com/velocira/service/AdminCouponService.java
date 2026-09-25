package com.velocira.service;

import com.velocira.dto.coupon.CouponResponse;
import com.velocira.dto.coupon.CouponUpsertRequest;
import com.velocira.entity.Coupon;
import com.velocira.exception.ResourceNotFoundException;
import com.velocira.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminCouponService {

    private final CouponRepository couponRepository;
    private final AuditLogService auditLogService;

    @PreAuthorize("hasRole('ADMIN')")
    public List<CouponResponse> listAll() {
        return couponRepository.findAll().stream().map(this::toResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public CouponResponse create(CouponUpsertRequest req) {
        if (couponRepository.findByCodeIgnoreCaseAndActiveTrue(req.code()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A coupon with this code already exists.");
        }
        Coupon coupon = new Coupon();
        applyRequest(coupon, req);
        Coupon saved = couponRepository.save(coupon);
        auditLogService.record("ADMIN_CREATED_COUPON", "COUPON", saved.getId().toString(), saved.getCode());
        return toResponse(saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public CouponResponse update(UUID id, CouponUpsertRequest req) {
        Coupon coupon = couponRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Coupon not found."));
        applyRequest(coupon, req);
        Coupon saved = couponRepository.save(coupon);
        auditLogService.record("ADMIN_UPDATED_COUPON", "COUPON", saved.getId().toString(), saved.getCode());
        return toResponse(saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deactivate(UUID id) {
        Coupon coupon = couponRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Coupon not found."));
        coupon.setActive(false);
        couponRepository.save(coupon);
        auditLogService.record("ADMIN_DEACTIVATED_COUPON", "COUPON", id.toString(), coupon.getCode());
    }

    private void applyRequest(Coupon coupon, CouponUpsertRequest req) {
        coupon.setCode(req.code().toUpperCase());
        coupon.setDiscountType(req.discountType());
        coupon.setDiscountValue(req.discountValue());
        coupon.setMinBookingAmount(req.minBookingAmount());
        coupon.setMaxDiscountAmount(req.maxDiscountAmount());
        coupon.setStartDate(req.startDate());
        coupon.setEndDate(req.endDate());
        coupon.setUsageLimit(req.usageLimit());
        coupon.setUserUsageLimit(req.userUsageLimit());
        coupon.setActive(req.active());
    }

    private CouponResponse toResponse(Coupon c) {
        return new CouponResponse(
            c.getId(), c.getCode(), c.getDiscountType(), c.getDiscountValue(),
            c.getMinBookingAmount(), c.getMaxDiscountAmount(), c.getStartDate(), c.getEndDate(),
            c.getUsageLimit(), c.getUserUsageLimit(), c.isActive()
        );
    }
}
