package com.velocira.controller;

import com.velocira.dto.admin.DamageChargeRequest;
import com.velocira.dto.admin.DepositSettlementResponse;
import com.velocira.service.DepositSettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/bookings/{bookingId}/deposit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDepositController {

    private final DepositSettlementService depositSettlementService;

    @GetMapping
    public ResponseEntity<DepositSettlementResponse> getSettlement(@PathVariable UUID bookingId) {
        return ResponseEntity.ok(depositSettlementService.getSettlement(bookingId));
    }

    @PostMapping("/charges")
    public ResponseEntity<Void> addCharge(@PathVariable UUID bookingId, @Valid @RequestBody DamageChargeRequest request) {
        depositSettlementService.addCharge(bookingId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/settle")
    public ResponseEntity<DepositSettlementResponse> settle(@PathVariable UUID bookingId) {
        return ResponseEntity.ok(depositSettlementService.settleAndComplete(bookingId));
    }
}
