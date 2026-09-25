package com.velocira.dto.car;

import java.math.BigDecimal;
import java.util.UUID;

public record CarSummaryDto(
    UUID id,
    String slug,
    String brand,
    String model,
    String variant,
    int year,
    String category,
    String primaryImageUrl,
    double rating,
    int reviewCount,
    BigDecimal pricePerDay,
    String transmission,
    String fuel,
    int seats,
    String locationCity,
    String status
) {}
