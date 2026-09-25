package com.velocira.controller;

import com.velocira.dto.admin.AdminCustomerSummary;
import com.velocira.dto.admin.AdminCustomerUpsertRequest;
import com.velocira.dto.document.DocumentResponse;
import com.velocira.service.AdminCustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    @GetMapping
    public ResponseEntity<List<AdminCustomerSummary>> listAll() {
        return ResponseEntity.ok(adminCustomerService.listAll());
    }

    @PostMapping
    public ResponseEntity<AdminCustomerSummary> create(@Valid @RequestBody AdminCustomerUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminCustomerService.createCustomer(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminCustomerSummary> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(adminCustomerService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminCustomerSummary> update(@PathVariable UUID id, @Valid @RequestBody AdminCustomerUpsertRequest request) {
        return ResponseEntity.ok(adminCustomerService.updateCustomer(id, request));
    }

    @PostMapping("/{id}/block")
    public ResponseEntity<Void> block(@PathVariable UUID id) {
        adminCustomerService.setActive(id, false);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/unblock")
    public ResponseEntity<Void> unblock(@PathVariable UUID id) {
        adminCustomerService.setActive(id, true);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<DocumentResponse>> getDocuments(@PathVariable UUID id) {
        return ResponseEntity.ok(adminCustomerService.getCustomerDocuments(id));
    }
}
