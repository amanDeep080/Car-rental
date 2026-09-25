package com.velocira.service;

import com.velocira.entity.enums.BookingStatus;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import static com.velocira.entity.enums.BookingStatus.*;

@Component
public class BookingStatusTransitionValidator {

    private static final Map<BookingStatus, Set<BookingStatus>> ALLOWED = new EnumMap<>(BookingStatus.class);

    static {
        ALLOWED.put(PENDING, EnumSet.of(AWAITING_VERIFICATION, AWAITING_PAYMENT, CANCELLED));
        // AWAITING_VERIFICATION -> CONFIRMED (direct) exists for Cash-on-
        // Delivery bookings: there's no online payment gate to route
        // through, so once documents are verified an admin confirms
        // directly. Online bookings still go through AWAITING_PAYMENT via
        // the Razorpay webhook, as before.
        ALLOWED.put(AWAITING_VERIFICATION, EnumSet.of(AWAITING_PAYMENT, CONFIRMED, CANCELLED));
        ALLOWED.put(AWAITING_PAYMENT, EnumSet.of(CONFIRMED, CANCELLED));
        ALLOWED.put(CONFIRMED, EnumSet.of(READY_FOR_PICKUP, ACTIVE, CANCELLED));
        ALLOWED.put(READY_FOR_PICKUP, EnumSet.of(ACTIVE, CANCELLED));
        ALLOWED.put(ACTIVE, EnumSet.of(RETURNED));
        ALLOWED.put(RETURNED, EnumSet.of(INSPECTION_PENDING, COMPLETED));
        ALLOWED.put(INSPECTION_PENDING, EnumSet.of(COMPLETED, REFUND_PENDING));
        ALLOWED.put(REFUND_PENDING, EnumSet.of(REFUNDED));
        ALLOWED.put(CANCELLED, EnumSet.of(REFUND_PENDING));
        ALLOWED.put(REFUNDED, EnumSet.noneOf(BookingStatus.class));
        ALLOWED.put(COMPLETED, EnumSet.noneOf(BookingStatus.class));
    }

    public boolean isAllowed(BookingStatus from, BookingStatus to) {
        return ALLOWED.getOrDefault(from, Set.of()).contains(to);
    }

    public void assertAllowed(BookingStatus from, BookingStatus to) {
        if (!isAllowed(from, to)) {
            throw new IllegalStateException("Cannot transition booking from " + from + " to " + to);
        }
    }
}
