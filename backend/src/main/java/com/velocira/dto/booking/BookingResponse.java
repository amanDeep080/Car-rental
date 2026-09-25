package com.velocira.dto.booking;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record BookingResponse(
    UUID id,
    String bookingReference,
    String status,
    UUID carId,
    String carBrand,
    String carModel,
    String carVariant,
    String carImageUrl,
    String pickupLocationName,
    String returnLocationName,
    Instant pickupAt,
    Instant returnAt,
    long durationDays,
    long durationHours,
    BigDecimal rentalAmount,
    BigDecimal addonsAmount,
    BigDecimal taxAmount,
    BigDecimal discountAmount,
    BigDecimal securityDepositAmount,
    BigDecimal totalPayable,
    String paymentMethod,
    List<BookingAddonLine> addons
) {
    public record BookingAddonLine(String name, BigDecimal price) {}
}
