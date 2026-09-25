package com.velocira.controller;

import com.velocira.dto.admin.AdminBookingDetail;
import com.velocira.dto.admin.AdminBookingSummary;
import com.velocira.service.AdminBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final AdminBookingService adminBookingService;

    @GetMapping
    public ResponseEntity<List<AdminBookingSummary>> search(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String customerEmail
    ) {
        return ResponseEntity.ok(adminBookingService.search(status, customerEmail));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminBookingDetail> getDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(adminBookingService.getDetail(id));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<Void> confirm(@PathVariable UUID id) {
        adminBookingService.confirmBooking(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable UUID id, @RequestBody(required = false) Map<String, String> body) {
        adminBookingService.cancelBooking(id, body == null ? null : body.get("reason"));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/ready")
    public ResponseEntity<Void> markReady(@PathVariable UUID id) {
        adminBookingService.markReady(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pickup")
    public ResponseEntity<Void> pickup(@PathVariable UUID id) {
        adminBookingService.markPickedUp(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<Void> markReturned(@PathVariable UUID id) {
        adminBookingService.markReturned(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Void> complete(@PathVariable UUID id) {
        adminBookingService.markCompleted(id);
        return ResponseEntity.noContent().build();
    }
}
