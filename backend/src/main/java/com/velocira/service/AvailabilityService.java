package com.velocira.service;

import com.velocira.entity.Car;
import com.velocira.entity.enums.BookingStatus;
import com.velocira.entity.enums.CarStatus;
import com.velocira.exception.CarUnavailableException;
import com.velocira.repository.BookingRepository;
import com.velocira.repository.CarRepository;
import com.velocira.repository.VehicleBlockedDateRepository;
import com.velocira.repository.VehicleMaintenanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AvailabilityService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final VehicleBlockedDateRepository blockedDateRepository;
    private final VehicleMaintenanceRepository maintenanceRepository;

    @Autowired
    public AvailabilityService(BookingRepository bookingRepository, CarRepository carRepository,
                               VehicleBlockedDateRepository blockedDateRepository,
                               VehicleMaintenanceRepository maintenanceRepository) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.blockedDateRepository = blockedDateRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    /** Compatibility constructor for read-only availability unit tests. */
    public AvailabilityService(BookingRepository bookingRepository,
                               VehicleBlockedDateRepository blockedDateRepository,
                               VehicleMaintenanceRepository maintenanceRepository) {
        this(bookingRepository, null, blockedDateRepository, maintenanceRepository);
    }

    // Statuses that actually hold the vehicle. PENDING/AWAITING_VERIFICATION/
    // AWAITING_PAYMENT bookings that never completed checkout do not occupy
    // the calendar (spec §18 "pending booking rules").
    private static final List<BookingStatus> BLOCKING_STATUSES = List.of(
        BookingStatus.CONFIRMED,
        BookingStatus.READY_FOR_PICKUP,
        BookingStatus.ACTIVE,
        BookingStatus.RETURNED,
        BookingStatus.INSPECTION_PENDING
    );

    public Optional<com.velocira.entity.Booking> nextBlockingBooking(UUID carId, Instant at) {
        return bookingRepository.findCurrentBlocking(carId, at, BLOCKING_STATUSES).stream().findFirst();
    }

    /** Read-only check used while browsing / building the search results grid. */
    public boolean isAvailable(Car car, Instant start, Instant end) {
        if (start == null || end == null || !start.isBefore(end)) {
            throw new IllegalArgumentException("Invalid date range.");
        }
        if (car.getStatus() == CarStatus.INACTIVE) {
            return false;
        }
        boolean bookingConflict = !bookingRepository
            .findOverlapping(car.getId(), start, end, BLOCKING_STATUSES).isEmpty();
        boolean blockedConflict = !blockedDateRepository
            .findOverlapping(car.getId(), start, end).isEmpty();
        boolean maintenanceConflict = !maintenanceRepository
            .findOverlapping(car.getId(), start, end).isEmpty();

        return !bookingConflict && !blockedConflict && !maintenanceConflict;
    }

    /**
     * Final, authoritative check taken immediately before a booking is
     * confirmed. Runs inside its own transaction and takes a pessimistic
     * write lock on any overlapping bookings so two concurrent checkouts for
     * the same window can't both succeed (spec §66). Call this from
     * BookingService.confirmBooking, never trust an earlier isAvailable()
     * result by itself.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void assertAvailableForBookingOrThrow(UUID carId, Instant start, Instant end) {
        // Lock the car even when no booking row exists yet.
        if (carRepository != null) {
            carRepository.findByIdForUpdate(carId)
                .orElseThrow(() -> new CarUnavailableException("This vehicle is no longer available."));
        }
        List<?> lockedBookings = bookingRepository.lockOverlapping(carId, start, end, BLOCKING_STATUSES);
        if (!lockedBookings.isEmpty()) {
            throw new CarUnavailableException("This vehicle was just booked for an overlapping window.");
        }
        if (!blockedDateRepository.findOverlapping(carId, start, end).isEmpty()) {
            throw new CarUnavailableException("This vehicle is blocked for the requested dates.");
        }
        if (!maintenanceRepository.findOverlapping(carId, start, end).isEmpty()) {
            throw new CarUnavailableException("This vehicle is under maintenance for the requested dates.");
        }
    }
}
