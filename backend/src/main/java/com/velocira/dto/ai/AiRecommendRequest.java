package com.velocira.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiRecommendRequest(
    @NotBlank @Size(max = 500) String query
) {}
