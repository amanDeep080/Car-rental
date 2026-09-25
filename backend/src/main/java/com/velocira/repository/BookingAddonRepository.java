package com.velocira.repository;

import com.velocira.entity.BookingAddon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BookingAddonRepository extends JpaRepository<BookingAddon, UUID> {
    List<BookingAddon> findAllByBookingId(UUID bookingId);
}
