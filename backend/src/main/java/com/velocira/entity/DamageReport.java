package com.velocira.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "damage_reports")
@Getter
@Setter
@NoArgsConstructor
public class DamageReport extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    // DAMAGE, LATE_RETURN, FUEL, CLEANING, OTHER (spec §24)
    @Column(nullable = false, length = 20)
    private String chargeType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(optional = false)
    @JoinColumn(name = "recorded_by_admin_id", nullable = false)
    private User recordedByAdmin;
}
