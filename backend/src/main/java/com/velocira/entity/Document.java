package com.velocira.entity;

import com.velocira.entity.enums.DocumentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
public class Document extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // DRIVING_LICENSE, GOVERNMENT_ID, PAN_CARD, PASSPORT, VISA, ADDRESS_PROOF
    @Column(nullable = false, length = 30)
    private String documentType;

    // Private storage key/URL (e.g. Cloudinary signed asset) — never a
    // public-read URL. Access must be brokered through an authenticated
    // endpoint, never returned directly to unauthenticated clients.
    @Column(nullable = false, length = 500)
    private String storageKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DocumentStatus status = DocumentStatus.PENDING;

    private String rejectionReason;
    private java.time.Instant expiresAt;
    private java.time.Instant reviewedAt;

    @ManyToOne
    @JoinColumn(name = "reviewed_by_admin_id")
    private User reviewedByAdmin;
}
