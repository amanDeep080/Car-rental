package com.velocira.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "addons")
@Getter
@Setter
@NoArgsConstructor
public class Addon extends BaseEntity {

    @Column(nullable = false, length = 80)
    private String name; // e.g. "Zero Depreciation Insurance", "Extra Mileage Pack", "Child Seat", "GPS Navigator"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // FLAT = one-time charge, PER_DAY = multiplied by rental duration in days
    @Column(nullable = false, length = 20)
    private String pricingType = "FLAT";

    @Column(nullable = false)
    private boolean active = true;
}
