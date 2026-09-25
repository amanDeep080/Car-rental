package com.velocira.dto.maintenance;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MaintenanceResponse(
    UUID id,
    UUID carId,
    String carLabel,
    String serviceType,
    Instant startsAt,
    Instant endsAt,
    Integer mileageAtService,
    BigDecimal cost,
    String notes,
    Instant nextServiceDate,
    Integer nextServiceMileage
) {}
