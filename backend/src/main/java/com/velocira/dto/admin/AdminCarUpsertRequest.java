package com.velocira.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record AdminCarUpsertRequest(
    @NotBlank String slug,
    @NotBlank String brand,
    @NotBlank String model,
    String variant,
    @NotNull Integer year,
    String registrationNumber,
    @NotBlank String category,
    @NotBlank String fuel,          // PETROL, DIESEL, ELECTRIC, HYBRID
    @NotBlank String transmission,  // MANUAL, AUTOMATIC
    @NotNull @Positive Integer seats,
    Integer doors,
    String engine,
    String power,
    String mileagePolicy,
    @NotNull @Positive BigDecimal pricePerDay,
    BigDecimal pricePerSixHours,
    BigDecimal pricePerTwelveHours,
    BigDecimal pricePerTwentyFourHours,
    BigDecimal pricePerWeek,
    BigDecimal pricePerMonth,
    @PositiveOrZero BigDecimal securityDeposit,
    @NotNull UUID locationId,
    String status,
    String description,
    String rentalPolicy,
    List<String> features,
    List<String> imageUrls
) {}
