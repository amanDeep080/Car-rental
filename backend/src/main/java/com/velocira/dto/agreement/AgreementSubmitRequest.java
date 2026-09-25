package com.velocira.dto.agreement;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AgreementSubmitRequest(
    @NotBlank String fullName,
    String guardianRelation,
    String guardianName,
    @NotBlank String residentAddress,
    @NotBlank String drivingLicenseNumber,
    String universityRegistrationNumber,
    @NotBlank String idProofType,
    @NotBlank String idProofNumber,
    @NotBlank String mobileNumber,
    @NotNull @Positive Integer kmPerDayLimit,
    @AssertTrue(message = "You must agree to the rental agreement and terms to continue") boolean agreedToTerms
) {}
