package com.velocira.dto.review;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
    UUID id,
    String reviewerName,
    int overallRating,
    Integer cleanlinessRating,
    Integer conditionRating,
    String comment,
    Instant createdAt
) {}
