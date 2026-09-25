package com.velocira.dto.admin;

import java.util.UUID;

public record AdminLocationResponse(
    UUID id,
    String city,
    String branchName,
    String address,
    String contactNumber,
    String openingHours,
    Double latitude,
    Double longitude,
    Boolean active
) {}
