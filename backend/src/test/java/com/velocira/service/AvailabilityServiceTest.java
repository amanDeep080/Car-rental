package com.velocira.service;

import com.velocira.entity.Booking;
import com.velocira.entity.Car;
import com.velocira.entity.VehicleBlockedDate;
import com.velocira.entity.VehicleMaintenance;
import com.velocira.entity.enums.CarStatus;
import com.velocira.exception.CarUnavailableException;
import com.velocira.repository.BookingRepository;
import com.velocira.repository.VehicleBlockedDateRepository;
import com.velocira.repository.VehicleMaintenanceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvailabilityServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private VehicleBlockedDateRepository blockedDateRepository;
    @Mock private VehicleMaintenanceRepository maintenanceRepository;

    private AvailabilityService availabilityService;
    private Car car;
    private final Instant now = Instant.now();

    @BeforeEach
    void setUp() {
        availabilityService = new AvailabilityService(bookingRepository, blockedDateRepository, maintenanceRepository);
        car = new Car();
        car.setId(UUID.randomUUID());
        car.setStatus(CarStatus.AVAILABLE);
    }

    @Test
    void isAvailable_returnsTrue_whenNoConflictsExist() {
        when(bookingRepository.findOverlapping(any(), any(), any(), any())).thenReturn(List.of());
        when(blockedDateRepository.findOverlapping(any(), any(), any())).thenReturn(List.of());
        when(maintenanceRepository.findOverlapping(any(), any(), any())).thenReturn(List.of());

        boolean available = availabilityService.isAvailable(car, now, now.plus(1, ChronoUnit.DAYS));

        assertTrue(available);
    }

    @Test
    void isAvailable_returnsFalse_whenAnOverlappingConfirmedBookingExists() {
        when(bookingRepository.findOverlapping(any(), any(), any(), any())).thenReturn(List.of(new Booking()));

        boolean available = availabilityService.isAvailable(car, now, now.plus(1, ChronoUnit.DAYS));

        assertFalse(available);
    }

    @Test
    void isAvailable_returnsFalse_whenCarIsInactive() {
        car.setStatus(CarStatus.INACTIVE);

        boolean available = availabilityService.isAvailable(car, now, now.plus(1, ChronoUnit.DAYS));

        assertFalse(available);
        // Should short-circuit before even querying the database for an inactive car.
        verifyNoInteractions(bookingRepository, blockedDateRepository, maintenanceRepository);
    }

    @Test
    void isAvailable_returnsFalse_whenBlockedByAdmin() {
        when(bookingRepository.findOverlapping(any(), any(), any(), any())).thenReturn(List.of());
        when(blockedDateRepository.findOverlapping(any(), any(), any())).thenReturn(List.of(new VehicleBlockedDate()));

        boolean available = availabilityService.isAvailable(car, now, now.plus(1, ChronoUnit.DAYS));

        assertFalse(available);
    }

    @Test
    void isAvailable_returnsFalse_whenUnderMaintenance() {
        when(bookingRepository.findOverlapping(any(), any(), any(), any())).thenReturn(List.of());
        when(blockedDateRepository.findOverlapping(any(), any(), any())).thenReturn(List.of());
        when(maintenanceRepository.findOverlapping(any(), any(), any())).thenReturn(List.of(new VehicleMaintenance()));

        boolean available = availabilityService.isAvailable(car, now, now.plus(1, ChronoUnit.DAYS));

        assertFalse(available);
    }

    @Test
    void isAvailable_rejectsInvertedDateRange() {
        assertThrows(IllegalArgumentException.class,
            () -> availabilityService.isAvailable(car, now.plus(1, ChronoUnit.DAYS), now));
    }

    /**
     * The core double-booking prevention guarantee (spec §66): the final,
     * lock-protected check must throw if ANY overlapping booking exists,
     * even if an earlier isAvailable() call said yes — this simulates the
     * race condition where two customers both pass the initial check
     * before either one commits.
     */
    @Test
    void assertAvailableForBookingOrThrow_throwsWhenALockedOverlapIsFound() {
        UUID carId = UUID.randomUUID();
        when(bookingRepository.lockOverlapping(any(), any(), any(), any())).thenReturn(List.of(new Booking()));

        assertThrows(CarUnavailableException.class,
            () -> availabilityService.assertAvailableForBookingOrThrow(carId, now, now.plus(1, ChronoUnit.DAYS)));
    }

    @Test
    void assertAvailableForBookingOrThrow_succeedsSilently_whenNoConflicts() {
        UUID carId = UUID.randomUUID();
        when(bookingRepository.lockOverlapping(any(), any(), any(), any())).thenReturn(List.of());
        when(blockedDateRepository.findOverlapping(any(), any(), any())).thenReturn(List.of());
        when(maintenanceRepository.findOverlapping(any(), any(), any())).thenReturn(List.of());

        assertDoesNotThrow(() ->
            availabilityService.assertAvailableForBookingOrThrow(carId, now, now.plus(1, ChronoUnit.DAYS)));
    }

    @Test
    void assertAvailableForBookingOrThrow_throwsForBlockedDatesEvenWithoutBookingConflict() {
        UUID carId = UUID.randomUUID();
        when(bookingRepository.lockOverlapping(any(), any(), any(), any())).thenReturn(List.of());
        when(blockedDateRepository.findOverlapping(any(), any(), any())).thenReturn(List.of(new VehicleBlockedDate()));

        assertThrows(CarUnavailableException.class,
            () -> availabilityService.assertAvailableForBookingOrThrow(carId, now, now.plus(1, ChronoUnit.DAYS)));
    }
}
