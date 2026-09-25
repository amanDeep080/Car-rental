package com.velocira.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
public class AuditLog extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String action; // e.g. "ADMIN_ADDED_VEHICLE", "ADMIN_CHANGED_PRICE", "ADMIN_APPROVED_DOCUMENT"

    @Column(nullable = false, length = 40)
    private String entityType; // "CAR", "BOOKING", "DOCUMENT", "COUPON", "CUSTOMER"

    private String entityId;

    @Column(nullable = false, length = 120)
    private String performedBy; // user id or email of the acting admin

    @Column(columnDefinition = "TEXT")
    private String metadata; // free-form JSON-ish context, e.g. old/new values
}
