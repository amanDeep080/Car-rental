package com.velocira.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "rental_agreements")
@Getter
@Setter
@NoArgsConstructor
public class RentalAgreement extends BaseEntity {

    @OneToOne(optional = false)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    // --- Deponent (renter) details, from the affidavit ---
    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(length = 120)
    private String guardianRelation; // "son of" / "daughter of" / "wife of"

    @Column(length = 120)
    private String guardianName;

    @Column(nullable = false, length = 300)
    private String residentAddress;

    @Column(nullable = false, length = 40)
    private String drivingLicenseNumber;

    @Column(length = 40)
    private String universityRegistrationNumber; // "LPU Registration Number (IF)" on the source form

    @Column(nullable = false, length = 20)
    private String idProofType; // AADHAAR, PAN, PASSPORT

    @Column(nullable = false, length = 40)
    private String idProofNumber;

    @Column(nullable = false, length = 20)
    private String mobileNumber;

    // --- Vehicle details, snapshotted at agreement time ---
    @Column(nullable = false, length = 120)
    private String vehicleLabel; // "Mahindra Thar Roxx AX7L 4x4"

    @Column(length = 30)
    private String registrationNumber;

    @Column(length = 40)
    private String chassisNumber;

    @Column(length = 40)
    private String engineNumber;

    // --- Terms specific to this rental, from the affidavit ---
    @Column(nullable = false)
    private Integer kmPerDayLimit;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal rentPerDay;

    // --- Consent, replacing the ink signature/thumbprint on the source form ---
    @Column(nullable = false)
    private boolean agreedToTerms = false;

    private Instant agreedAt;

    @Column(length = 64)
    private String agreedFromIp;
}
