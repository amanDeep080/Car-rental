package com.velocira.dto.admin;

import java.time.Instant;
import java.util.UUID;

public record AdminCustomerSummary(
    UUID id,
    String fullName,
    String email,
    String phone,
    boolean active,
    boolean emailVerified,
    Instant createdAt,
    Instant lastSeenAt,
    long totalBookings
) {}
