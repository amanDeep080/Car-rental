package com.velocira.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
public class Location extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String city;

    @Column(nullable = false, length = 160)
    private String branchName;

    @Column(nullable = false, length = 300)
    private String address;

    private Double latitude;
    private Double longitude;

    @Column(length = 20)
    private String contactNumber;

    private String openingHours;

    @Column(nullable = false)
    private boolean active = true;

    public boolean isActive() {
        return active;
    }
}
