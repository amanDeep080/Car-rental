package com.velocira.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UserProfileUpdateRequest(
    @NotBlank @Size(max = 120) String fullName,
    @NotBlank @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Enter a valid phone number") String phone,
    LocalDate dateOfBirth
) {}
