package com.velocira.service;

import com.velocira.entity.enums.BookingStatus;
import org.junit.jupiter.api.Test;

import static com.velocira.entity.enums.BookingStatus.*;
import static org.junit.jupiter.api.Assertions.*;

class BookingStatusTransitionValidatorTest {

    private final BookingStatusTransitionValidator validator = new BookingStatusTransitionValidator();

    @Test
    void allowsTheFullHappyPathLifecycle() {
        assertTrue(validator.isAllowed(PENDING, AWAITING_VERIFICATION));
        assertTrue(validator.isAllowed(AWAITING_VERIFICATION, AWAITING_PAYMENT));
        assertTrue(validator.isAllowed(AWAITING_PAYMENT, CONFIRMED));
        assertTrue(validator.isAllowed(CONFIRMED, READY_FOR_PICKUP));
        assertTrue(validator.isAllowed(READY_FOR_PICKUP, ACTIVE));
        assertTrue(validator.isAllowed(ACTIVE, RETURNED));
        assertTrue(validator.isAllowed(RETURNED, INSPECTION_PENDING));
        assertTrue(validator.isAllowed(INSPECTION_PENDING, COMPLETED));
        // Direct jump from RETURNED to COMPLETED is allowed to skip formal inspection status.
        assertTrue(validator.isAllowed(RETURNED, COMPLETED));
    }

    @Test
    void allowsCancellationFromEveryPreConfirmedOrConfirmedState() {
        assertTrue(validator.isAllowed(PENDING, CANCELLED));
        assertTrue(validator.isAllowed(AWAITING_VERIFICATION, CANCELLED));
        assertTrue(validator.isAllowed(AWAITING_PAYMENT, CANCELLED));
        assertTrue(validator.isAllowed(CONFIRMED, CANCELLED));
        assertTrue(validator.isAllowed(READY_FOR_PICKUP, CANCELLED));
    }

    @Test
    void rejectsCancellationOnceTheVehicleIsActiveOrLater() {
        // Once the customer has the car, "cancel" is no longer a legal
        // transition — this is what stops an admin fat-fingering a cancel
        // on a booking that's mid-rental.
        assertFalse(validator.isAllowed(ACTIVE, CANCELLED));
        assertFalse(validator.isAllowed(RETURNED, CANCELLED));
        assertFalse(validator.isAllowed(COMPLETED, CANCELLED));
    }

    @Test
    void rejectsSkippingStatesInTheLifecycle() {
        // Can't jump straight from PENDING to CONFIRMED, skipping
        // verification and payment.
        assertFalse(validator.isAllowed(PENDING, CONFIRMED));
        // Jump from CONFIRMED straight to ACTIVE is allowed for efficiency (skipping optional READY_FOR_PICKUP).
        assertTrue(validator.isAllowed(CONFIRMED, ACTIVE));
        // Can't jump from ACTIVE straight to COMPLETED, skipping return + inspection.
        assertFalse(validator.isAllowed(ACTIVE, COMPLETED));
    }

    @Test
    void terminalStatesAllowNoFurtherTransitions() {
        for (BookingStatus target : BookingStatus.values()) {
            assertFalse(validator.isAllowed(COMPLETED, target), "COMPLETED -> " + target + " should be rejected");
            assertFalse(validator.isAllowed(REFUNDED, target), "REFUNDED -> " + target + " should be rejected");
        }
    }

    @Test
    void assertAllowedThrowsOnIllegalTransition() {
        assertThrows(IllegalStateException.class, () -> validator.assertAllowed(PENDING, CONFIRMED));
    }

    @Test
    void assertAllowedDoesNotThrowOnLegalTransition() {
        assertDoesNotThrow(() -> validator.assertAllowed(PENDING, AWAITING_VERIFICATION));
    }

    @Test
    void allowsDirectConfirmationFromAwaitingVerification_forCodBookings() {
        // COD bookings have no online payment gate to route through — once
        // documents are verified, admin confirms directly.
        assertTrue(validator.isAllowed(AWAITING_VERIFICATION, CONFIRMED));
    }
}
