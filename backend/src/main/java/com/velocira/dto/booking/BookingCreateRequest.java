package com.velocira.dto.booking;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record BookingCreateRequest(
    @NotNull UUID carId,
    @NotNull UUID pickupLocationId,
    @NotNull UUID returnLocationId,
    @NotNull Instant pickupAt,
    @NotNull Instant returnAt,
    List<UUID> addonIds,
    String couponCode,
    String paymentMethod, // "ONLINE" or "COD" — defaults to ONLINE if omitted
    UUID onBehalfOfUserId // Optional, for ADMINs booking for users
) {}
