package com.velocira.dto.maintenance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MaintenanceCreateRequest(
    @NotNull UUID carId,
    @NotBlank String serviceType,
    @NotNull Instant startsAt,
    Instant endsAt,
    Integer mileageAtService,
    BigDecimal cost,
    String notes,
    Instant nextServiceDate,
    Integer nextServiceMileage
) {}
