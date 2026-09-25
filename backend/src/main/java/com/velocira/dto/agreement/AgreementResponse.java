package com.velocira.dto.agreement;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AgreementResponse(
    UUID id,
    String fullName,
    String guardianRelation,
    String guardianName,
    String residentAddress,
    String drivingLicenseNumber,
    String universityRegistrationNumber,
    String idProofType,
    String idProofNumber,
    String mobileNumber,
    String vehicleLabel,
    String registrationNumber,
    String chassisNumber,
    String engineNumber,
    Integer kmPerDayLimit,
    BigDecimal rentPerDay,
    boolean agreedToTerms,
    Instant agreedAt
) {}
