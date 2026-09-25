package com.velocira.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "car_images")
@Getter
@Setter
@NoArgsConstructor
public class CarImage extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(length = 30)
    private String category; // EXTERIOR, INTERIOR, DASHBOARD

    private Integer sortOrder = 0;
}
