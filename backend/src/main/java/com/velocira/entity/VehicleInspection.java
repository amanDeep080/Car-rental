package com.velocira.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicle_inspections")
@Getter
@Setter
@NoArgsConstructor
public class VehicleInspection extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    // PICKUP or RETURN
    @Column(nullable = false, length = 10)
    private String inspectionType;

    @ManyToOne(optional = false)
    @JoinColumn(name = "recorded_by_user_id", nullable = false)
    private User recordedBy;

    private String frontCondition;
    private String rearCondition;
    private String leftSideCondition;
    private String rightSideCondition;
    private String interiorCondition;
    private String wheelsCondition;

    private Integer fuelLevelPercent;
    private Integer odometerReading;

    @Column(columnDefinition = "TEXT")
    private String existingDamageNotes;

    @ElementCollection
    @CollectionTable(name = "inspection_photos", joinColumns = @JoinColumn(name = "inspection_id"))
    @Column(name = "photo_url")
    private List<String> photoUrls = new ArrayList<>();

    // "I have inspected and accepted the vehicle condition." (spec §26)
    @Column(nullable = false)
    private boolean customerAcknowledged = false;

    private Instant acknowledgedAt;
}
