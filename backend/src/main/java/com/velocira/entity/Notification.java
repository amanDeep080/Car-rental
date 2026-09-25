package com.velocira.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // BOOKING_CONFIRMED, PICKUP_REMINDER, RETURN_REMINDER, CANCELLATION,
    // REFUND, DOCUMENT_APPROVED, DOCUMENT_REJECTED, PROMOTIONAL, etc.
    @Column(nullable = false, length = 40)
    private String type;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false)
    private boolean read = false;

    // Which channels this was (attempted to be) delivered through.
    @Column(nullable = false, length = 60)
    private String channels = "IN_APP"; // comma-separated: IN_APP,EMAIL,SMS
}
