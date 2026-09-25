package com.velocira.dto.analytics;

import java.util.List;

public record AnalyticsOverview(
    List<RevenuePoint> revenueByMonth,
    List<TopCar> topCars,
    List<TopLocation> topLocations,
    long newCustomersLast30Days,
    long repeatCustomers,
    double fleetUtilizationPercent
) {}
