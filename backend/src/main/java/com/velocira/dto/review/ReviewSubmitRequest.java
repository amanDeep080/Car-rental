package com.velocira.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ReviewSubmitRequest(
    @NotBlank String bookingReference,
    @Min(1) @Max(5) int overallRating,
    @Min(1) @Max(5) Integer cleanlinessRating,
    @Min(1) @Max(5) Integer conditionRating,
    String comment
) {}
