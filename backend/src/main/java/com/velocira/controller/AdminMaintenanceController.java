package com.velocira.controller;

import com.velocira.dto.maintenance.MaintenanceCreateRequest;
import com.velocira.dto.maintenance.MaintenanceResponse;
import com.velocira.service.AdminMaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/maintenance")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMaintenanceController {

    private final AdminMaintenanceService maintenanceService;

    @PostMapping
    public ResponseEntity<MaintenanceResponse> create(@Valid @RequestBody MaintenanceCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(maintenanceService.create(request));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Void> complete(@PathVariable UUID id) {
        maintenanceService.complete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/car/{carId}")
    public ResponseEntity<List<MaintenanceResponse>> forCar(@PathVariable UUID carId) {
        return ResponseEntity.ok(maintenanceService.listForCar(carId));
    }
}
