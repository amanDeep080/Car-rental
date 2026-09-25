package com.velocira.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record AdminLocationUpsertRequest(
    @NotBlank String city,
    @NotBlank String branchName,
    @NotBlank String address,
    String contactNumber,
    String openingHours,
    Double latitude,
    Double longitude,
    Boolean active
) {}
