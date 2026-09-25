package com.velocira.controller;

import com.velocira.dto.admin.AuditLogEntryDto;
import com.velocira.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<Page<AuditLogEntryDto>> recent(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        Page<AuditLogEntryDto> dtos = auditLogService.recent(PageRequest.of(page, size))
            .map(a -> new AuditLogEntryDto(
                a.getId(), a.getAction(), a.getEntityType(), a.getEntityId(), a.getPerformedBy(), a.getMetadata(), a.getCreatedAt()
            ));
        return ResponseEntity.ok(dtos);
    }
}
