package com.velocira.entity.enums;

/** Booking state machine — see spec §22. Only forward transitions defined in
 *  BookingStatusTransitionValidator are allowed; invalid jumps are rejected. */
public enum BookingStatus {
    PENDING,
    AWAITING_VERIFICATION,
    AWAITING_PAYMENT,
    CONFIRMED,
    READY_FOR_PICKUP,
    ACTIVE,
    RETURNED,
    INSPECTION_PENDING,
    COMPLETED,
    CANCELLED,
    REFUND_PENDING,
    REFUNDED
}
