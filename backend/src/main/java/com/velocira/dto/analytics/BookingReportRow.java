package com.velocira.dto.analytics;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BookingReportRow(
    UUID bookingId,
    String customer,
    String car,
    Instant pickupAt,
    Instant returnAt,
    long durationDays,
    long durationHours,
    String status,
    BigDecimal amount
) {}
