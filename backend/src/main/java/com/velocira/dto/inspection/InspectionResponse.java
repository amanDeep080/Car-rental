package com.velocira.dto.inspection;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record InspectionResponse(
    UUID id,
    String inspectionType,
    Integer fuelLevelPercent,
    Integer odometerReading,
    String existingDamageNotes,
    List<String> photoUrls,
    boolean customerAcknowledged,
    Instant acknowledgedAt
) {}
