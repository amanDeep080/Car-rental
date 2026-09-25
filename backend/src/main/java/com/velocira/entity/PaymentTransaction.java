package com.velocira.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@NoArgsConstructor
public class PaymentTransaction extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    // ORDER_CREATED, WEBHOOK_RECEIVED, SIGNATURE_VERIFIED, SIGNATURE_INVALID,
    // CAPTURED, FAILED, REFUND_INITIATED, REFUND_COMPLETED
    @Column(nullable = false, length = 40)
    private String eventType;

    @Column(columnDefinition = "TEXT")
    private String rawPayload; // raw webhook body, stored for audit/dispute resolution

    @Column(length = 20)
    private String resultingStatus;
}
