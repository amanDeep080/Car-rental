package com.velocira.service;

import com.velocira.dto.inspection.InspectionResponse;
import com.velocira.dto.inspection.InspectionSubmitRequest;
import com.velocira.entity.Booking;
import com.velocira.entity.User;
import com.velocira.entity.VehicleInspection;
import com.velocira.entity.enums.BookingStatus;
import com.velocira.exception.ResourceNotFoundException;
import com.velocira.repository.BookingRepository;
import com.velocira.repository.UserRepository;
import com.velocira.repository.VehicleInspectionRepository;
import com.velocira.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InspectionService {

    private final VehicleInspectionRepository inspectionRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final BookingStatusTransitionValidator transitionValidator;

    @Transactional
    public InspectionResponse submit(String bookingReference, InspectionSubmitRequest req) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

        if (!"PICKUP".equals(req.inspectionType()) && !"RETURN".equals(req.inspectionType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "inspectionType must be PICKUP or RETURN.");
        }

        VehicleInspection inspection = new VehicleInspection();
        inspection.setBooking(booking);
        inspection.setInspectionType(req.inspectionType());
        inspection.setRecordedBy(currentUser());
        inspection.setFrontCondition(req.frontCondition());
        inspection.setRearCondition(req.rearCondition());
        inspection.setLeftSideCondition(req.leftSideCondition());
        inspection.setRightSideCondition(req.rightSideCondition());
        inspection.setInteriorCondition(req.interiorCondition());
        inspection.setWheelsCondition(req.wheelsCondition());
        inspection.setFuelLevelPercent(req.fuelLevelPercent());
        inspection.setOdometerReading(req.odometerReading());
        inspection.setExistingDamageNotes(req.existingDamageNotes());
        if (req.photoUrls() != null) inspection.getPhotoUrls().addAll(req.photoUrls());
        inspection.setCustomerAcknowledged(req.customerAcknowledged());
        if (req.customerAcknowledged()) inspection.setAcknowledgedAt(Instant.now());

        VehicleInspection saved = inspectionRepository.save(inspection);

        // A completed, acknowledged PICKUP inspection is what actually
        // hands the car over — advance READY_FOR_PICKUP -> ACTIVE here so
        // the state machine reflects reality, not just an admin button
        // click (this complements AdminBookingService.markPickedUp, which
        // covers the case where the handover was recorded off-system).
        if ("PICKUP".equals(req.inspectionType()) && req.customerAcknowledged()
            && transitionValidator.isAllowed(booking.getStatus(), BookingStatus.ACTIVE)) {
            booking.setStatus(BookingStatus.ACTIVE);
            bookingRepository.save(booking);
        }
        if ("RETURN".equals(req.inspectionType())
            && transitionValidator.isAllowed(booking.getStatus(), BookingStatus.INSPECTION_PENDING)) {
            booking.setStatus(BookingStatus.INSPECTION_PENDING);
            bookingRepository.save(booking);
        }

        return toResponse(saved);
    }

    public InspectionResponse get(String bookingReference, String type) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        return inspectionRepository.findByBookingIdAndInspectionType(booking.getId(), type)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("No " + type + " inspection recorded yet."));
    }

    private InspectionResponse toResponse(VehicleInspection i) {
        return new InspectionResponse(
            i.getId(), i.getInspectionType(), i.getFuelLevelPercent(), i.getOdometerReading(),
            i.getExistingDamageNotes(), i.getPhotoUrls(), i.isCustomerAcknowledged(), i.getAcknowledgedAt()
        );
    }

    private User currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in to continue.");
        }
        return userRepository.findById(principal.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account no longer exists."));
    }
}
