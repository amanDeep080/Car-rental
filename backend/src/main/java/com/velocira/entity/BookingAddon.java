package com.velocira.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "booking_addons")
@Getter
@Setter
@NoArgsConstructor
public class BookingAddon extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(optional = false)
    @JoinColumn(name = "addon_id", nullable = false)
    private Addon addon;

    // Snapshot of the addon name/price at booking time so later admin price
    // changes never retroactively alter a past booking's invoice.
    @Column(nullable = false, length = 80)
    private String addonNameSnapshot;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal priceSnapshot;
}
