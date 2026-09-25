package com.velocira.service;

import com.velocira.dto.document.DocumentResponse;
import com.velocira.dto.document.DocumentUploadRequest;
import com.velocira.entity.Document;
import com.velocira.entity.User;
import com.velocira.entity.enums.DocumentStatus;
import com.velocira.repository.DocumentRepository;
import com.velocira.repository.UserRepository;
import com.velocira.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    @org.springframework.transaction.annotation.Transactional
    public DocumentResponse upload(DocumentUploadRequest req) {
        User user = currentUser();

        // Mark existing documents of same type as deleted (soft-delete)
        // so we only keep one "active" version per type.
        List<Document> existing = documentRepository.findAllByUserId(user.getId());
        for (Document d : existing) {
            if (d.getDocumentType().equals(req.documentType()) && d.getDeletedAt() == null) {
                d.setDeletedAt(java.time.Instant.now());
            }
        }
        documentRepository.saveAll(existing);

        Document doc = new Document();
        doc.setUser(user);
        doc.setDocumentType(req.documentType());
        doc.setStorageKey(req.storageKey());
        doc.setStatus(DocumentStatus.PENDING);

        Document saved = documentRepository.save(doc);
        return toResponse(saved);
    }

    public List<DocumentResponse> myDocuments() {
        User user = currentUser();
        return documentRepository.findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(user.getId()).stream().map(this::toResponse).toList();
    }

    private DocumentResponse toResponse(Document d) {
        return new DocumentResponse(
            d.getId(), d.getDocumentType(), d.getStatus().name(), d.getRejectionReason(), d.getCreatedAt(), d.getStorageKey(),
            d.getUser().getId(), d.getUser().getFullName(), d.getUser().getEmail(), d.getUser().getPhone()
        );
    }

    private User currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in to continue.");
        }
        return userRepository.findById(principal.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account no longer exists."));
    }
}
