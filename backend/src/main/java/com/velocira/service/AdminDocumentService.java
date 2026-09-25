package com.velocira.service;

import com.velocira.dto.document.DocumentResponse;
import com.velocira.entity.Document;
import com.velocira.entity.enums.DocumentStatus;
import com.velocira.exception.ResourceNotFoundException;
import com.velocira.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminDocumentService {

    private final DocumentRepository documentRepository;
    private final AuditLogService auditLogService;

    @PreAuthorize("hasRole('ADMIN')")
    public List<DocumentResponse> pendingQueue() {
        return documentRepository.findAllByStatusOrderByCreatedAtAsc(DocumentStatus.PENDING).stream()
            .map(this::toResponse)
            .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public DocumentResponse approve(UUID documentId) {
        Document doc = getOrThrow(documentId);
        doc.setStatus(DocumentStatus.VERIFIED);
        doc.setReviewedAt(Instant.now());
        doc.setRejectionReason(null);
        auditLogService.record("ADMIN_APPROVED_DOCUMENT", "DOCUMENT", documentId.toString(), doc.getUser().getFullName() + " - " + doc.getDocumentType());
        return toResponse(documentRepository.save(doc));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public DocumentResponse reject(UUID documentId, String reason) {
        Document doc = getOrThrow(documentId);
        doc.setStatus(DocumentStatus.REJECTED);
        doc.setReviewedAt(Instant.now());
        doc.setRejectionReason(reason);
        auditLogService.record("ADMIN_REJECTED_DOCUMENT", "DOCUMENT", documentId.toString(), doc.getUser().getFullName() + " - " + doc.getDocumentType() + (reason != null ? ": " + reason : ""));
        return toResponse(documentRepository.save(doc));
    }

    private Document getOrThrow(UUID id) {
        return documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found."));
    }

    private DocumentResponse toResponse(Document d) {
        return new DocumentResponse(
            d.getId(), d.getDocumentType(), d.getStatus().name(), d.getRejectionReason(), d.getCreatedAt(), d.getStorageKey(),
            d.getUser().getId(), d.getUser().getFullName(), d.getUser().getEmail(), d.getUser().getPhone()
        );
    }
}
