package com.velocira.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "vehicle_maintenance")
@Getter
@Setter
@NoArgsConstructor
public class VehicleMaintenance extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @Column(nullable = false, length = 60)
    private String serviceType;

    @Column(nullable = false)
    private Instant startsAt;

    // Null while the vehicle is still in the shop — an open-ended maintenance
    // window blocks the car indefinitely until this is set.
    private Instant endsAt;

    private Integer mileageAtService;
    private BigDecimal cost;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private Instant nextServiceDate;
    private Integer nextServiceMileage;
}
