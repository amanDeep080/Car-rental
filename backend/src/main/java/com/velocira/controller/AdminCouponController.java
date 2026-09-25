package com.velocira.controller;

import com.velocira.dto.coupon.CouponResponse;
import com.velocira.dto.coupon.CouponUpsertRequest;
import com.velocira.service.AdminCouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCouponController {

    private final AdminCouponService adminCouponService;

    @GetMapping
    public ResponseEntity<List<CouponResponse>> listAll() {
        return ResponseEntity.ok(adminCouponService.listAll());
    }

    @PostMapping
    public ResponseEntity<CouponResponse> create(@Valid @RequestBody CouponUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminCouponService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CouponResponse> update(@PathVariable UUID id, @Valid @RequestBody CouponUpsertRequest request) {
        return ResponseEntity.ok(adminCouponService.update(id, request));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable UUID id) {
        adminCouponService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
