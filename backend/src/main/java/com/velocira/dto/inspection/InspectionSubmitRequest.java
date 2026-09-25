package com.velocira.dto.inspection;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record InspectionSubmitRequest(
    @NotBlank String inspectionType, // PICKUP or RETURN
    String frontCondition,
    String rearCondition,
    String leftSideCondition,
    String rightSideCondition,
    String interiorCondition,
    String wheelsCondition,
    @Min(0) @Max(100) Integer fuelLevelPercent,
    @NotNull Integer odometerReading,
    String existingDamageNotes,
    List<String> photoUrls,
    boolean customerAcknowledged
) {}
