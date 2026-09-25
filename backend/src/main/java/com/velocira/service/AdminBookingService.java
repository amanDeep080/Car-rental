package com.velocira.service;

import com.velocira.dto.admin.AdminBookingDetail;
import com.velocira.dto.admin.AdminBookingSummary;
import com.velocira.entity.Booking;
import com.velocira.entity.BookingStatusHistory;
import com.velocira.entity.RentalAgreement;
import com.velocira.entity.enums.BookingStatus;
import com.velocira.exception.ResourceNotFoundException;
import com.velocira.repository.BookingRepository;
import com.velocira.repository.BookingStatusHistoryRepository;
import com.velocira.repository.RentalAgreementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminBookingService {

    private final BookingRepository bookingRepository;
    private final BookingStatusHistoryRepository statusHistoryRepository;
    private final RentalAgreementRepository rentalAgreementRepository;
    private final BookingStatusTransitionValidator transitionValidator;
    private final AvailabilityService availabilityService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminBookingSummary> search(String status, String customerEmail) {
        Specification<Booking> spec = Specification.where((root, query, cb) -> cb.isNull(root.get("deletedAt")));

        if (status != null && !status.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), BookingStatus.valueOf(status)));
        }
        if (customerEmail != null && !customerEmail.isBlank()) {
            spec = spec.and((root, query, cb) ->
                cb.like(cb.lower(root.get("user").get("email")), "%" + customerEmail.toLowerCase() + "%"));
        }

        return bookingRepository.findAll(spec).stream().map(this::toSummary).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public AdminBookingDetail getDetail(UUID id) {
        Booking b = getOrThrow(id);
        RentalAgreement ra = rentalAgreementRepository.findByBookingId(id).orElse(null);
        List<BookingStatusHistory> history = statusHistoryRepository.findAllByBookingIdOrderByCreatedAtDesc(id);

        return new AdminBookingDetail(
            b.getId(),
            b.getBookingReference(),
            b.getStatus().name(),
            new AdminBookingDetail.CustomerInfo(b.getUser().getId(), b.getUser().getFullName(), b.getUser().getEmail(), b.getUser().getPhone()),
            new AdminBookingDetail.CarInfo(b.getCar().getId(), b.getCar().getBrand(), b.getCar().getModel(), b.getCar().getVariant(), b.getCar().getRegistrationNumber()),
            b.getPickupAt(),
            b.getReturnAt(),
            durationDays(b),
            durationHours(b),
            b.getRentalAmount(),
            b.getTotalPayable(),
            b.getPaymentMethod(),
            ra == null ? null : new AdminBookingDetail.AgreementInfo(
                ra.getFullName(), ra.getGuardianRelation(), ra.getGuardianName(), ra.getResidentAddress(),
                ra.getDrivingLicenseNumber(), ra.getUniversityRegistrationNumber(), ra.getIdProofType(),
                ra.getIdProofNumber(), ra.getMobileNumber(), ra.getKmPerDayLimit(), ra.getRentPerDay()
            ),
            history.stream().map(h -> new AdminBookingDetail.StatusHistoryInfo(
                h.getFromStatus() != null ? h.getFromStatus().name() : "START", 
                h.getToStatus() != null ? h.getToStatus().name() : "UNKNOWN", 
                h.getChangedBy(), h.getNote(), h.getCreatedAt()
            )).toList()
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void confirmBooking(UUID id) {
        Booking booking = getOrThrow(id);
        transitionValidator.assertAllowed(booking.getStatus(), BookingStatus.CONFIRMED);
        availabilityService.assertAvailableForBookingOrThrow(
            booking.getCar().getId(), booking.getPickupAt(), booking.getReturnAt());
        applyTransition(booking, BookingStatus.CONFIRMED, "Confirmed by admin");
        auditLogService.record("ADMIN_CONFIRMED_BOOKING", "BOOKING", booking.getId().toString(), booking.getBookingReference());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void cancelBooking(UUID id, String reason) {
        Booking booking = getOrThrow(id);
        if (!transitionValidator.isAllowed(booking.getStatus(), BookingStatus.CANCELLED)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Cannot cancel a booking with status " + booking.getStatus());
        }
        applyTransition(booking, BookingStatus.CANCELLED, "Cancelled by admin" + (reason != null ? ": " + reason : ""));
        auditLogService.record("ADMIN_CANCELLED_BOOKING", "BOOKING", booking.getId().toString(), booking.getBookingReference() + (reason != null ? " | " + reason : ""));
        notificationService.notify(
            booking.getUser(), "BOOKING_CANCELLED",
            "Booking cancelled — " + booking.getBookingReference(),
            "Your booking was cancelled by our team" + (reason != null ? ": " + reason : ".") ,
            java.util.Set.of("EMAIL")
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void markReady(UUID id) {
        Booking booking = getOrThrow(id);
        transitionValidator.assertAllowed(booking.getStatus(), BookingStatus.READY_FOR_PICKUP);
        applyTransition(booking, BookingStatus.READY_FOR_PICKUP, "Vehicle prepared and ready for pickup");
        auditLogService.record("ADMIN_MARK_READY", "BOOKING", booking.getId().toString(), booking.getBookingReference());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void markPickedUp(UUID id) {
        Booking booking = getOrThrow(id);
        log.info("Transitioning booking {} from {} to ACTIVE", booking.getBookingReference(), booking.getStatus());
        
        // Use the validator to ensure this is a legal move
        transitionValidator.assertAllowed(booking.getStatus(), BookingStatus.ACTIVE);

        applyTransition(booking, BookingStatus.ACTIVE, "Vehicle handed over at pickup");
        auditLogService.record("ADMIN_MARK_PICKED_UP", "BOOKING", booking.getId().toString(), booking.getBookingReference());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void markReturned(UUID id) {
        Booking booking = getOrThrow(id);
        transitionValidator.assertAllowed(booking.getStatus(), BookingStatus.RETURNED);
        applyTransition(booking, BookingStatus.RETURNED, "Vehicle returned, awaiting inspection");
        auditLogService.record("ADMIN_MARK_RETURNED", "BOOKING", booking.getId().toString(), booking.getBookingReference());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void markCompleted(UUID id) {
        Booking booking = getOrThrow(id);
        transitionValidator.assertAllowed(booking.getStatus(), BookingStatus.COMPLETED);
        applyTransition(booking, BookingStatus.COMPLETED, "Inspection passed, booking completed");
        auditLogService.record("ADMIN_MARK_COMPLETED", "BOOKING", booking.getId().toString(), booking.getBookingReference());
    }

    private Booking getOrThrow(UUID id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
    }

    private void applyTransition(Booking booking, BookingStatus to, String note) {
        BookingStatus from = booking.getStatus();
        booking.setStatus(to);
        bookingRepository.save(booking);

        BookingStatusHistory history = new BookingStatusHistory();
        history.setBooking(booking);
        history.setFromStatus(from);
        history.setToStatus(to);
        history.setChangedBy("ADMIN");
        history.setNote(note);
        statusHistoryRepository.save(history);
    }

    private AdminBookingSummary toSummary(Booking b) {
        return new AdminBookingSummary(
            b.getId(),
            b.getBookingReference(),
            b.getStatus().name(),
            b.getUser().getFullName(),
            b.getUser().getEmail(),
            b.getCar().getBrand() + " " + b.getCar().getModel() + " " + b.getCar().getVariant(),
            b.getPickupAt(),
            b.getReturnAt(),
            durationDays(b),
            durationHours(b),
            b.getTotalPayable()
        );
    }

    private long durationDays(Booking booking) {
        return java.time.Duration.between(booking.getPickupAt(), booking.getReturnAt()).toHours() / 24;
    }

    private long durationHours(Booking booking) {
        return java.time.Duration.between(booking.getPickupAt(), booking.getReturnAt()).toHours() % 24;
    }
}
