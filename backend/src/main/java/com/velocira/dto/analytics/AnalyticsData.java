package com.velocira.dto.analytics;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AnalyticsData(
    Instant from,
    Instant to,
    BigDecimal revenue,
    long bookings,
    long activeRentals,
    long completedRentals,
    long cancelledBookings,
    long totalCars,
    long availableCars,
    long currentlyBookedCars,
    BigDecimal averageBookingValue,
    long totalRentalHours,
    double averageRentalHours,
    List<RevenuePoint> monthlyRevenue,
    List<RevenuePoint> dailyRevenue,
    List<RevenuePoint> weeklyRevenue,
    List<BookingCountPoint> bookingTrend,
    List<StatusCount> bookingStatuses,
    List<StatusCount> durationBuckets,
    List<StatusCount> pickupTimes,
    List<CarPerformance> carPerformance,
    List<CarPerformance> utilization,
    BigDecimal previousPeriodRevenue,
    PeakAnalytics peaks
) {
    public record BookingCountPoint(String period, long bookingCount) {}
    public record StatusCount(String status, long count) {}
    public record CarPerformance(String carId, String label, long bookingCount, long rentalHours, BigDecimal revenue) {}
    public record PeakAnalytics(String pickupDay, String pickupTime, String busiestMonth) {}
}
