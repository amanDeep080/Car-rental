package com.velocira.service;

import com.velocira.dto.analytics.AnalyticsOverview;
import com.velocira.dto.analytics.RevenuePoint;
import com.velocira.dto.analytics.TopCar;
import com.velocira.dto.analytics.TopLocation;
import com.velocira.dto.analytics.AnalyticsData;
import com.velocira.dto.analytics.BookingReportRow;
import com.velocira.entity.enums.BookingStatus;
import com.velocira.repository.BookingRepository;
import com.velocira.repository.CarRepository;
import com.velocira.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    @PreAuthorize("hasRole('ADMIN')")
    public AnalyticsOverview getOverview() {
        Instant sixMonthsAgo = Instant.now().minus(180, ChronoUnit.DAYS);
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);

        List<RevenuePoint> revenueByMonth = bookingRepository.revenueByMonthRaw(sixMonthsAgo).stream()
            .map(row -> new RevenuePoint((String) row[0], (BigDecimal) row[1], ((Number) row[2]).longValue()))
            .toList();

        List<TopCar> topCars = bookingRepository.topCarsRaw(5).stream()
            .map(row -> new TopCar(
                (UUID) row[0], (String) row[1], ((Number) row[2]).longValue(), (BigDecimal) row[3]
            ))
            .toList();

        List<TopLocation> topLocations = bookingRepository.topLocationsRaw(5).stream()
            .map(row -> new TopLocation((String) row[0], ((Number) row[1]).longValue()))
            .toList();

        long newCustomers = userRepository.countByCreatedAtGreaterThanEqual(thirtyDaysAgo);
        long repeatCustomers = bookingRepository.countRepeatCustomers();

        long totalCars = carRepository.count();
        long activeRentals = bookingRepository.countByStatus(BookingStatus.ACTIVE);
        double utilization = totalCars == 0 ? 0.0 : (activeRentals * 100.0) / totalCars;

        return new AnalyticsOverview(
            revenueByMonth, topCars, topLocations, newCustomers, repeatCustomers,
            Math.round(utilization * 10.0) / 10.0
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    public AnalyticsData getData(Instant from, Instant to) {
        Instant effectiveTo = to == null ? Instant.now() : to;
        Instant effectiveFrom = from == null ? effectiveTo.minus(365, ChronoUnit.DAYS) : from;
        if (!effectiveFrom.isBefore(effectiveTo)) {
            throw new IllegalArgumentException("Analytics start must be before analytics end.");
        }

        Object[] totals = unwrapRow(bookingRepository.analyticsTotals(effectiveFrom, effectiveTo));
        BigDecimal revenue = decimalValue(totals[0]);
        long completedBookings = ((Number) totals[1]).longValue();
        long rentalHours = Math.round(((Number) totals[2]).doubleValue());
        double averageHours = ((Number) totals[3]).doubleValue();

        Map<String, Long> statuses = new HashMap<>();
        bookingRepository.analyticsStatusCounts(effectiveFrom, effectiveTo).forEach(row ->
            statuses.put(String.valueOf(row[0]), ((Number) row[1]).longValue()));

        List<AnalyticsData.CarPerformance> cars = bookingRepository.analyticsCarPerformance(effectiveFrom, effectiveTo, 10).stream()
            .map(row -> new AnalyticsData.CarPerformance(
                String.valueOf(row[0]), String.valueOf(row[1]), ((Number) row[2]).longValue(),
                Math.round(((Number) row[3]).doubleValue()), decimalValue(row[4])))
            .toList();

        List<AnalyticsData.CarPerformance> utilization = bookingRepository.analyticsUtilization(effectiveFrom, effectiveTo).stream()
            .map(row -> new AnalyticsData.CarPerformance(
                String.valueOf(row[0]), String.valueOf(row[1]), ((Number) row[2]).longValue(),
                Math.round(((Number) row[3]).doubleValue()), decimalValue(row[4])))
            .toList();

        Instant previousFrom = effectiveFrom.minus(java.time.Duration.between(effectiveFrom, effectiveTo));
        BigDecimal previousRevenue = bookingRepository.sumRevenueBetween(previousFrom, effectiveFrom);

        List<Object[]> peaks = bookingRepository.analyticsPeaks(effectiveFrom, effectiveTo);
        AnalyticsData.PeakAnalytics peak = peaks.isEmpty()
            ? new AnalyticsData.PeakAnalytics("No data", "No data", "No data")
            : new AnalyticsData.PeakAnalytics(String.valueOf(peaks.get(0)[0]), String.valueOf(peaks.get(0)[1]), String.valueOf(peaks.get(0)[2]));

        return new AnalyticsData(
            effectiveFrom, effectiveTo, revenue, completedBookings,
            statuses.getOrDefault("ACTIVE", 0L), statuses.getOrDefault("COMPLETED", 0L),
            statuses.getOrDefault("CANCELLED", 0L), carRepository.count(),
            carRepository.countByStatus(com.velocira.entity.enums.CarStatus.AVAILABLE),
            carRepository.countCurrentlyBooked(Instant.now()),
            completedBookings == 0 ? BigDecimal.ZERO : revenue.divide(BigDecimal.valueOf(completedBookings), 2, java.math.RoundingMode.HALF_UP),
            rentalHours, averageHours,
            bookingRepository.analyticsMonthlyRevenue(effectiveFrom, effectiveTo).stream()
                .map(row -> new RevenuePoint(String.valueOf(row[0]), decimalValue(row[1]), ((Number) row[2]).longValue())).toList(),
            bookingRepository.analyticsDailyRevenue(effectiveFrom, effectiveTo).stream()
                .map(row -> new RevenuePoint(String.valueOf(row[0]), decimalValue(row[1]), ((Number) row[2]).longValue())).toList(),
            bookingRepository.analyticsWeeklyRevenue(effectiveFrom, effectiveTo).stream()
                .map(row -> new RevenuePoint(String.valueOf(row[0]), decimalValue(row[1]), ((Number) row[2]).longValue())).toList(),
            bookingRepository.analyticsDailyRevenue(effectiveFrom, effectiveTo).stream()
                .map(row -> new AnalyticsData.BookingCountPoint(String.valueOf(row[0]), ((Number) row[2]).longValue())).toList(),
            statuses.entrySet().stream().map(e -> new AnalyticsData.StatusCount(e.getKey(), e.getValue())).toList(),
            bookingRepository.analyticsDurationBuckets(effectiveFrom, effectiveTo).stream()
                .map(row -> new AnalyticsData.StatusCount(String.valueOf(row[0]), ((Number) row[1]).longValue())).toList(),
            bookingRepository.analyticsPickupTimes(effectiveFrom, effectiveTo).stream()
                .map(row -> new AnalyticsData.StatusCount(String.valueOf(row[0]), ((Number) row[1]).longValue())).toList(),
            cars, utilization, previousRevenue, peak
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<BookingReportRow> getBookingReport(Instant from, Instant to, String status, UUID carId) {
        Instant effectiveTo = to == null ? Instant.now() : to;
        Instant effectiveFrom = from == null ? effectiveTo.minus(365, ChronoUnit.DAYS) : from;
        return bookingRepository.reportBookings(effectiveFrom, effectiveTo, status, carId).stream()
                .map(row -> new BookingReportRow(
                (UUID) row[0], String.valueOf(row[1]), String.valueOf(row[2]),
                toInstant(row[3]), toInstant(row[4]), ((Number) row[5]).longValue(),
                ((Number) row[6]).longValue(), String.valueOf(row[7]), decimalValue(row[8])))
            .toList();
    }

    private Instant toInstant(Object value) {
        if (value instanceof Instant instant) return instant;
        if (value instanceof java.sql.Timestamp timestamp) return timestamp.toInstant();
        return java.time.OffsetDateTime.parse(String.valueOf(value)).toInstant();
    }

    private BigDecimal decimalValue(Object value) {
        return value instanceof BigDecimal decimal ? decimal : BigDecimal.valueOf(((Number) value).doubleValue());
    }

    private Object[] unwrapRow(Object[] row) {
        return row.length == 1 && row[0] instanceof Object[] nested ? nested : row;
    }
}
