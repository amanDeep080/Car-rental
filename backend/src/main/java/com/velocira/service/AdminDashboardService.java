package com.velocira.service;

import com.velocira.dto.admin.AdminDashboardStats;
import com.velocira.entity.enums.BookingStatus;
import com.velocira.entity.enums.CarStatus;
import com.velocira.entity.enums.DocumentStatus;
import com.velocira.repository.BookingRepository;
import com.velocira.repository.CarRepository;
import com.velocira.repository.DocumentRepository;
import com.velocira.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.DayOfWeek;
import java.time.temporal.TemporalAdjusters;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;

    public AdminDashboardStats getStats() {
        Instant startOfToday = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        Instant startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant startOfMonth = today.withDayOfMonth(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant startOfYear = today.withDayOfYear(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant now = Instant.now();

        long totalBookings = bookingRepository.count();
        long cancelled = bookingRepository.countCancelled();
        double cancellationRate = totalBookings == 0 ? 0.0 : (cancelled * 100.0) / totalBookings;

        return new AdminDashboardStats(
            bookingRepository.sumTotalRevenue(),
            bookingRepository.sumRevenueSince(startOfToday),
            totalBookings,
            bookingRepository.countByCreatedAtGreaterThanEqual(startOfToday),
            bookingRepository.countByStatus(BookingStatus.ACTIVE),
            carRepository.countByStatus(CarStatus.AVAILABLE),
            carRepository.countByStatus(CarStatus.MAINTENANCE),
            userRepository.count(),
            documentRepository.countByStatusIn(java.util.List.of(DocumentStatus.PENDING, DocumentStatus.UNDER_REVIEW)),
            bookingRepository.countByStatus(BookingStatus.INSPECTION_PENDING),
            Math.round(cancellationRate * 10.0) / 10.0,
            bookingRepository.sumRevenueBetween(startOfWeek, now),
            bookingRepository.sumRevenueBetween(startOfMonth, now),
            bookingRepository.sumRevenueBetween(startOfYear, now),
            bookingRepository.countByStatus(BookingStatus.COMPLETED),
            cancelled,
            carRepository.count(),
            carRepository.countCurrentlyBooked(now)
        );
    }
}
