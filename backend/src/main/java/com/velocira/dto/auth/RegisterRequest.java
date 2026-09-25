package com.velocira.dto.auth;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record RegisterRequest(
    @NotBlank @Size(max = 120) String fullName,
    @NotBlank @Email @Size(max = 180) String email,
    @NotBlank @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Enter a valid phone number") String phone,
    @NotBlank @Size(min = 8, max = 72, message = "Password must be at least 8 characters") String password,
    @NotBlank String confirmPassword,
    LocalDate dateOfBirth,
    @AssertTrue(message = "You must accept the Terms & Conditions") boolean acceptedTerms,
    @AssertTrue(message = "You must accept the Privacy Policy") boolean acceptedPrivacyPolicy
) {}
