package com.velocira.controller;

import com.velocira.dto.document.DocumentResponse;
import com.velocira.service.AdminDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/documents")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDocumentController {

    private final AdminDocumentService adminDocumentService;

    @GetMapping("/pending")
    public ResponseEntity<List<DocumentResponse>> pendingQueue() {
        return ResponseEntity.ok(adminDocumentService.pendingQueue());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<DocumentResponse> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(adminDocumentService.approve(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<DocumentResponse> reject(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminDocumentService.reject(id, body.get("reason")));
    }
}
