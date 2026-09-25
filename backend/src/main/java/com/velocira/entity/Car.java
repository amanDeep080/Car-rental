package com.velocira.entity;

import com.velocira.entity.enums.CarStatus;
import com.velocira.entity.enums.FuelType;
import com.velocira.entity.enums.Transmission;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cars", indexes = {
    @Index(name = "idx_cars_status", columnList = "status"),
    @Index(name = "idx_cars_slug", columnList = "slug", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
public class Car extends BaseEntity {

    @Column(nullable = false, unique = true, length = 160)
    private String slug; // e.g. "bmw-3-series" — used for SEO routes (spec §46)

    @Column(nullable = false, length = 60)
    private String brand;

    @Column(nullable = false, length = 60)
    private String model;

    @Column(length = 60)
    private String variant;

    @Column(nullable = false)
    private Integer year;

    @Column(length = 30)
    private String registrationNumber;

    @Column(length = 40)
    private String chassisNumber;

    @Column(length = 40)
    private String engineNumber;

    @Column(nullable = false, length = 40)
    private String category; // e.g. "Luxury Sedan", "Compact SUV"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FuelType fuel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Transmission transmission;

    @Column(nullable = false)
    private Integer seats;

    private Integer doors;
    private String engine;
    private String power;

    @Column(length = 120)
    private String mileagePolicy; // e.g. "150 km/day included, ₹12/km after"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerDay;

    // Short-duration tiers, common in this market for same-day/weekend use —
    // optional; null means the car is only offered on day/week/month terms.
    private BigDecimal pricePerSixHours;
    private BigDecimal pricePerTwelveHours;
    private BigDecimal pricePerTwentyFourHours;

    private BigDecimal pricePerWeek;
    private BigDecimal pricePerMonth;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal securityDeposit;

    @ManyToOne(optional = false)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CarStatus status = CarStatus.AVAILABLE;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String rentalPolicy;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    private List<CarImage> images = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "car_features", joinColumns = @JoinColumn(name = "car_id"))
    @Column(name = "feature")
    @Fetch(FetchMode.SUBSELECT)
    private List<String> features = new ArrayList<>();
}
