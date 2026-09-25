package com.velocira.repository;

import com.velocira.entity.Document;
import com.velocira.entity.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findAllByUserId(UUID userId);
    List<Document> findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID userId);
    boolean existsByUserIdAndDocumentTypeAndStatus(UUID userId, String documentType, DocumentStatus status);
    long countByStatusIn(List<DocumentStatus> statuses);
    List<Document> findAllByStatusOrderByCreatedAtAsc(DocumentStatus status);
    List<Document> findAllByDeletedAtIsNullOrderByCreatedAtAsc();
}
