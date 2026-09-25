package com.velocira.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AdminBookingSummary(
    UUID id,
    String bookingReference,
    String status,
    String customerName,
    String customerEmail,
    String carLabel,
    Instant pickupAt,
    Instant returnAt,
    long durationDays,
    long durationHours,
    BigDecimal totalPayable
) {}
