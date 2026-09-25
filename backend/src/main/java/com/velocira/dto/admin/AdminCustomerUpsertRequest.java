package com.velocira.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record AdminCustomerUpsertRequest(
    @NotBlank String fullName,
    @NotBlank @Email String email,
    String phone,
    String password, // Only for creation, optional for update
    LocalDate dateOfBirth,
    boolean emailVerified,
    boolean active
) {}
