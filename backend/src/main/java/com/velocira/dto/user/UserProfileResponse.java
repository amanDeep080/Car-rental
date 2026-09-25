package com.velocira.dto.user;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record UserProfileResponse(
    UUID id,
    String fullName,
    String email,
    String phone,
    LocalDate dateOfBirth,
    boolean emailVerified,
    boolean phoneVerified,
    List<String> roles
) {}
