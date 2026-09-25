package com.velocira.service;

import com.velocira.dto.agreement.AgreementResponse;
import com.velocira.dto.agreement.AgreementSubmitRequest;
import com.velocira.entity.Booking;
import com.velocira.entity.RentalAgreement;
import com.velocira.exception.ResourceNotFoundException;
import com.velocira.repository.BookingRepository;
import com.velocira.repository.RentalAgreementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RentalAgreementService {

    private final RentalAgreementRepository agreementRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public AgreementResponse submit(String bookingReference, AgreementSubmitRequest req, String clientIp) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

        if (!req.agreedToTerms()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You must agree to the terms to continue.");
        }

        RentalAgreement agreement = agreementRepository.findByBookingId(booking.getId())
            .orElseGet(RentalAgreement::new);

        agreement.setBooking(booking);
        agreement.setFullName(req.fullName());
        agreement.setGuardianRelation(req.guardianRelation());
        agreement.setGuardianName(req.guardianName());
        agreement.setResidentAddress(req.residentAddress());
        agreement.setDrivingLicenseNumber(req.drivingLicenseNumber());
        agreement.setUniversityRegistrationNumber(req.universityRegistrationNumber());
        agreement.setIdProofType(req.idProofType());
        agreement.setIdProofNumber(req.idProofNumber());
        agreement.setMobileNumber(req.mobileNumber());

        // Vehicle identity is snapshotted from the actual booked car, not
        // re-typed by the customer — the affidavit's registration/chassis/
        // engine fields describe a specific real vehicle, so this must come
        // from our own records, never a free-text field the customer fills in.
        var car = booking.getCar();
        agreement.setVehicleLabel(car.getBrand() + " " + car.getModel() + " " + car.getVariant());
        agreement.setRegistrationNumber(car.getRegistrationNumber());
        agreement.setChassisNumber(car.getChassisNumber());
        agreement.setEngineNumber(car.getEngineNumber());

        agreement.setKmPerDayLimit(req.kmPerDayLimit());
        agreement.setRentPerDay(booking.getRentalAmount()); // the agreed rental rate for this booking

        agreement.setAgreedToTerms(true);
        agreement.setAgreedAt(Instant.now());
        agreement.setAgreedFromIp(clientIp);

        RentalAgreement saved = agreementRepository.save(agreement);
        return toResponse(saved);
    }

    public AgreementResponse get(String bookingReference) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        return agreementRepository.findByBookingId(booking.getId())
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("No agreement recorded for this booking yet."));
    }

    private AgreementResponse toResponse(RentalAgreement a) {
        return new AgreementResponse(
            a.getId(), a.getFullName(), a.getGuardianRelation(), a.getGuardianName(), a.getResidentAddress(),
            a.getDrivingLicenseNumber(), a.getUniversityRegistrationNumber(), a.getIdProofType(), a.getIdProofNumber(),
            a.getMobileNumber(), a.getVehicleLabel(), a.getRegistrationNumber(), a.getChassisNumber(),
            a.getEngineNumber(), a.getKmPerDayLimit(), a.getRentPerDay(), a.isAgreedToTerms(), a.getAgreedAt()
        );
    }
}
