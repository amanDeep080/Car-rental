package com.velocira.dto.admin;

import java.math.BigDecimal;

public record AdminDashboardStats(
    BigDecimal totalRevenue,
    BigDecimal todayRevenue,
    long totalBookings,
    long todayBookings,
    long activeRentals,
    long availableCars,
    long maintenanceCars,
    long totalCustomers,
    long pendingVerifications,
    long pendingInspections,
    double cancellationRatePercent
    ,BigDecimal weekRevenue
    ,BigDecimal monthRevenue
    ,BigDecimal yearRevenue
    ,long completedRentals
    ,long cancelledBookings
    ,long totalCars
    ,long currentlyBookedCars
) {}
