package com.velocira.dto.ai;

import com.velocira.dto.car.CarSummaryDto;

import java.util.List;

public record AiRecommendResponse(
    String explanation,
    List<CarSummaryDto> matches,
    ParsedIntent parsedIntent
) {
    public record ParsedIntent(
        String category,
        Integer minSeats,
        java.math.BigDecimal maxPricePerDay,
        String location,
        String transmission,
        String fuel
    ) {}
}
