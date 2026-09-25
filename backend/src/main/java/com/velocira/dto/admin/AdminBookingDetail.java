package com.velocira.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminBookingDetail(
    UUID id,
    String bookingReference,
    String status,
    CustomerInfo customer,
    CarInfo car,
    Instant pickupAt,
    Instant returnAt,
    long durationDays,
    long durationHours,
    BigDecimal rentalAmount,
    BigDecimal totalPayable,
    String paymentMethod,
    AgreementInfo agreement,
    List<StatusHistoryInfo> history
) {
    public record CustomerInfo(UUID id, String fullName, String email, String phone) {}
    public record CarInfo(UUID id, String brand, String model, String variant, String registrationNumber) {}
    public record AgreementInfo(
        String fullName,
        String guardianRelation,
        String guardianName,
        String residentAddress,
        String drivingLicenseNumber,
        String universityRegistrationNumber,
        String idProofType,
        String idProofNumber,
        String mobileNumber,
        Integer kmPerDayLimit,
        BigDecimal rentPerDay
    ) {}
    public record StatusHistoryInfo(String fromStatus, String toStatus, String changedBy, String note, Instant createdAt) {}
}
