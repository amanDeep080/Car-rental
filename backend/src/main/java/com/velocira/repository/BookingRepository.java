package com.velocira.repository;

import com.velocira.entity.Booking;
import com.velocira.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Booking> {

    /**
     * Core overlap check for the availability engine (spec §18, §65).
     * A requested window [requestedStart, requestedEnd) conflicts with an
     * existing booking [pickupAt, returnAt) when:
     *   requestedStart < existing.returnAt AND requestedEnd > existing.pickupAt
     * Only bookings in a status that actually holds the car are considered —
     * PENDING/AWAITING_* rows that never completed do not block the vehicle,
     * mirroring "Pending booking rules" from spec §18.
     */
    @Query("""
        SELECT b FROM Booking b
        WHERE b.car.id = :carId
          AND b.status IN :blockingStatuses
          AND b.pickupAt < :requestedEnd
          AND b.returnAt > :requestedStart
    """)
    List<Booking> findOverlapping(
        @Param("carId") UUID carId,
        @Param("requestedStart") Instant requestedStart,
        @Param("requestedEnd") Instant requestedEnd,
        @Param("blockingStatuses") List<BookingStatus> blockingStatuses
    );

    /**
     * Pessimistic row lock on any existing bookings for this car within the
     * window, taken immediately before final confirmation so two concurrent
     * requests for the same overlapping window cannot both pass the
     * availability check (spec §66 — concurrency).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT b FROM Booking b
        WHERE b.car.id = :carId
          AND b.status IN :blockingStatuses
          AND b.pickupAt < :requestedEnd
          AND b.returnAt > :requestedStart
    """)
    List<Booking> lockOverlapping(
        @Param("carId") UUID carId,
        @Param("requestedStart") Instant requestedStart,
        @Param("requestedEnd") Instant requestedEnd,
        @Param("blockingStatuses") List<BookingStatus> blockingStatuses
    );

    List<Booking> findByUserIdOrderByPickupAtDesc(UUID userId);

        @Query("""
        SELECT b FROM Booking b
        WHERE b.car.id = :carId
          AND b.status IN :blockingStatuses
                    AND b.pickupAt <= :at
          AND b.returnAt > :at
    """)
        List<Booking> findCurrentBlocking(
        @Param("carId") UUID carId,
        @Param("at") Instant at,
        @Param("blockingStatuses") List<BookingStatus> blockingStatuses
    );

    java.util.Optional<Booking> findByBookingReference(String bookingReference);

    // ---- Admin dashboard aggregates (spec §30) ----

    @Query("SELECT COALESCE(SUM(b.totalPayable), 0) FROM Booking b WHERE b.status <> 'CANCELLED'")
    java.math.BigDecimal sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(b.totalPayable), 0) FROM Booking b WHERE b.status <> 'CANCELLED' AND b.createdAt >= :since")
    java.math.BigDecimal sumRevenueSince(@Param("since") Instant since);

    @Query("SELECT COALESCE(SUM(b.totalPayable), 0) FROM Booking b WHERE b.status NOT IN ('CANCELLED', 'PENDING', 'AWAITING_VERIFICATION', 'AWAITING_PAYMENT') AND b.createdAt >= :from AND b.createdAt < :to")
    java.math.BigDecimal sumRevenueBetween(@Param("from") Instant from, @Param("to") Instant to);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt >= :from AND b.createdAt < :to")
    long countBetween(@Param("from") Instant from, @Param("to") Instant to);

    long countByCreatedAtGreaterThanEqual(Instant since);

    long countByStatus(BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'CANCELLED'")
    long countCancelled();

    // ---- Analytics (spec §59-60) ----

    @Query(value = """
        SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS period,
               COALESCE(SUM(total_payable), 0) AS revenue,
               COUNT(*) AS booking_count
        FROM bookings
        WHERE status <> 'CANCELLED' AND created_at >= :since
        GROUP BY period
        ORDER BY period
    """, nativeQuery = true)
    List<Object[]> revenueByMonthRaw(@Param("since") Instant since);

    @Query(value = """
        SELECT c.id, c.brand || ' ' || c.model || ' ' || COALESCE(c.variant, ''), COUNT(b.id), COALESCE(SUM(b.total_payable), 0)
        FROM bookings b JOIN cars c ON c.id = b.car_id
        WHERE b.status <> 'CANCELLED'
        GROUP BY c.id, c.brand, c.model, c.variant
        ORDER BY COUNT(b.id) DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<Object[]> topCarsRaw(@Param("limit") int limit);

    @Query(value = """
        SELECT l.city, COUNT(b.id)
        FROM bookings b JOIN locations l ON l.id = b.pickup_location_id
        WHERE b.status <> 'CANCELLED'
        GROUP BY l.city
        ORDER BY COUNT(b.id) DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<Object[]> topLocationsRaw(@Param("limit") int limit);

    @Query(value = """
        SELECT COUNT(*) FROM (
            SELECT user_id FROM bookings WHERE status <> 'CANCELLED'
            GROUP BY user_id HAVING COUNT(*) > 1
        ) repeatUsers
    """, nativeQuery = true)
    long countRepeatCustomers();

    @Query(value = """
         SELECT COALESCE(SUM(total_payable), 0::numeric), COUNT(*),
             COALESCE(SUM(EXTRACT(EPOCH FROM (return_at - pickup_at)) / 3600), 0::numeric),
             COALESCE(AVG(EXTRACT(EPOCH FROM (return_at - pickup_at)) / 3600), 0::numeric)
        FROM bookings
        WHERE created_at >= :from AND created_at < :to
          AND status NOT IN ('CANCELLED', 'PENDING', 'AWAITING_VERIFICATION', 'AWAITING_PAYMENT')
    """, nativeQuery = true)
    Object[] analyticsTotals(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = """
        SELECT to_char(date_trunc('month', created_at), 'YYYY-MM'),
               COALESCE(SUM(total_payable), 0), COUNT(*)
        FROM bookings
        WHERE created_at >= :from AND created_at < :to AND status <> 'CANCELLED'
        GROUP BY 1 ORDER BY 1
    """, nativeQuery = true)
    List<Object[]> analyticsMonthlyRevenue(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = """
        SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD'),
               COALESCE(SUM(total_payable), 0), COUNT(*)
        FROM bookings
        WHERE created_at >= :from AND created_at < :to AND status <> 'CANCELLED'
        GROUP BY 1 ORDER BY 1
    """, nativeQuery = true)
    List<Object[]> analyticsDailyRevenue(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = """
        SELECT to_char(date_trunc('week', created_at), 'YYYY-MM-DD'), COALESCE(SUM(total_payable), 0), COUNT(*)
        FROM bookings WHERE created_at >= :from AND created_at < :to AND status <> 'CANCELLED'
        GROUP BY 1 ORDER BY 1
    """, nativeQuery = true)
    List<Object[]> analyticsWeeklyRevenue(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = """
        SELECT CASE WHEN EXTRACT(EPOCH FROM (return_at - pickup_at)) / 3600 < 12 THEN 'Under 12 Hours'
                    WHEN EXTRACT(EPOCH FROM (return_at - pickup_at)) / 3600 < 24 THEN '12-23 Hours'
                    WHEN EXTRACT(EPOCH FROM (return_at - pickup_at)) / 3600 < 72 THEN '1-2 Days'
                    ELSE '3+ Days' END, COUNT(*)
        FROM bookings WHERE created_at >= :from AND created_at < :to AND status <> 'CANCELLED'
        GROUP BY 1 ORDER BY 1
    """, nativeQuery = true)
    List<Object[]> analyticsDurationBuckets(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = """
        SELECT to_char(pickup_at AT TIME ZONE 'UTC', 'HH24:00'), COUNT(*)
        FROM bookings WHERE created_at >= :from AND created_at < :to AND status <> 'CANCELLED'
        GROUP BY 1 ORDER BY 1
    """, nativeQuery = true)
    List<Object[]> analyticsPickupTimes(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = """
        SELECT status, COUNT(*) FROM bookings
        WHERE created_at >= :from AND created_at < :to
        GROUP BY status ORDER BY status
    """, nativeQuery = true)
    List<Object[]> analyticsStatusCounts(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = """
        SELECT c.id, c.brand || ' ' || c.model || ' ' || COALESCE(c.variant, ''), COUNT(b.id),
               COALESCE(SUM(EXTRACT(EPOCH FROM (b.return_at - b.pickup_at)) / 3600), 0),
               COALESCE(SUM(b.total_payable), 0)
        FROM bookings b JOIN cars c ON c.id = b.car_id
        WHERE b.created_at >= :from AND b.created_at < :to AND b.status <> 'CANCELLED'
        GROUP BY c.id, c.brand, c.model, c.variant
        ORDER BY COALESCE(SUM(b.total_payable), 0) DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<Object[]> analyticsCarPerformance(@Param("from") Instant from, @Param("to") Instant to, @Param("limit") int limit);

    @Query(value = """
        SELECT c.id, c.brand || ' ' || c.model || ' ' || COALESCE(c.variant, ''), COUNT(b.id),
               COALESCE(SUM(EXTRACT(EPOCH FROM (b.return_at - b.pickup_at)) / 3600), 0),
               COALESCE(SUM(b.total_payable), 0)
        FROM cars c LEFT JOIN bookings b ON b.car_id = c.id AND b.created_at >= :from AND b.created_at < :to AND b.status <> 'CANCELLED'
        WHERE c.deleted_at IS NULL
        GROUP BY c.id, c.brand, c.model, c.variant ORDER BY COUNT(b.id) DESC
    """, nativeQuery = true)
    List<Object[]> analyticsUtilization(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = """
        SELECT to_char(pickup_at AT TIME ZONE 'UTC', 'FMDay'),
               to_char(pickup_at AT TIME ZONE 'UTC', 'HH24:00'),
               to_char(pickup_at AT TIME ZONE 'UTC', 'YYYY-MM'), COUNT(*)
        FROM bookings
        WHERE created_at >= :from AND created_at < :to AND status <> 'CANCELLED'
        GROUP BY 1, 2, 3
        ORDER BY COUNT(*) DESC
    """, nativeQuery = true)
    List<Object[]> analyticsPeaks(@Param("from") Instant from, @Param("to") Instant to);

        @Query(value = """
                SELECT b.id, u.full_name, c.brand || ' ' || c.model || ' ' || COALESCE(c.variant, ''),
                             b.pickup_at, b.return_at,
                             FLOOR(EXTRACT(EPOCH FROM (b.return_at - b.pickup_at)) / 86400),
                             FLOOR(EXTRACT(EPOCH FROM (b.return_at - b.pickup_at)) / 3600) % 24,
                             b.status, b.total_payable
                FROM bookings b JOIN users u ON u.id = b.user_id JOIN cars c ON c.id = b.car_id
                WHERE b.created_at >= :from AND b.created_at < :to
                    AND (CAST(:status AS varchar) IS NULL OR b.status = CAST(:status AS varchar))
                    AND (CAST(:carId AS uuid) IS NULL OR b.car_id = CAST(:carId AS uuid))
                ORDER BY b.created_at DESC
        """, nativeQuery = true)
        List<Object[]> reportBookings(@Param("from") Instant from, @Param("to") Instant to,
                                                                    @Param("status") String status, @Param("carId") UUID carId);
}
