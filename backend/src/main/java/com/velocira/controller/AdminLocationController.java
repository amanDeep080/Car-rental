package com.velocira.controller;

import com.velocira.dto.admin.AdminLocationResponse;
import com.velocira.dto.admin.AdminLocationUpsertRequest;
import com.velocira.service.AdminLocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/locations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminLocationController {

    private final AdminLocationService adminLocationService;

    @GetMapping
    public ResponseEntity<List<AdminLocationResponse>> listAll() {
        return ResponseEntity.ok(adminLocationService.listAll());
    }

    @PostMapping
    public ResponseEntity<AdminLocationResponse> create(@Valid @RequestBody AdminLocationUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminLocationService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminLocationResponse> update(@PathVariable UUID id, @Valid @RequestBody AdminLocationUpsertRequest request) {
        return ResponseEntity.ok(adminLocationService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        adminLocationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
