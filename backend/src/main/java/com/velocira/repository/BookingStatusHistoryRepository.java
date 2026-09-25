package com.velocira.repository;

import com.velocira.entity.BookingStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BookingStatusHistoryRepository extends JpaRepository<BookingStatusHistory, UUID> {
    List<BookingStatusHistory> findAllByBookingIdOrderByCreatedAtAsc(UUID bookingId);
    List<BookingStatusHistory> findAllByBookingIdOrderByCreatedAtDesc(UUID bookingId);
}
