package com.velocira.dto.car;

import java.math.BigDecimal;
import java.time.Instant;

public record CarSearchRequest(
    String location,
    Instant pickupAt,
    Instant returnAt,
    String category,
    String brand,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    String transmission,
    String fuel,
    Integer minSeats,
    String sort
) {}
