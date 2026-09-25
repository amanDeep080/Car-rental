package com.velocira.entity;

import com.velocira.entity.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_bookings_car_window", columnList = "car_id, pickup_at, return_at"),
    @Index(name = "idx_bookings_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
public class Booking extends BaseEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String bookingReference; // e.g. "VLC-2026-000482", shown to the customer

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @ManyToOne(optional = false)
    @JoinColumn(name = "pickup_location_id", nullable = false)
    private Location pickupLocation;

    @ManyToOne(optional = false)
    @JoinColumn(name = "return_location_id", nullable = false)
    private Location returnLocation;

    // Requested window — this is what the availability engine checks for overlaps (spec §65).
    @Column(nullable = false)
    private Instant pickupAt;

    @Column(nullable = false)
    private Instant returnAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private BookingStatus status = BookingStatus.PENDING;

    // All amounts are computed server-side (spec §19/§23) — never trust a
    // frontend-supplied total.
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal rentalAmount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal addonsAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal securityDepositAmount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPayable;

    @Column(length = 40)
    private String couponCode;

    // ONLINE (Razorpay) or COD (cash at pickup) — spec's payment architecture
    // didn't originally include COD; added per business requirement.
    @Column(nullable = false, length = 10)
    private String paymentMethod = "ONLINE";
}
