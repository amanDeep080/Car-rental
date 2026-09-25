package com.velocira.dto.lookup;

import java.util.UUID;

public record LocationDto(
    UUID id, String city, String branchName, String address,
    Double latitude, Double longitude, String contactNumber, String openingHours
) {}
