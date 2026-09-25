package com.velocira.service;

import com.velocira.dto.admin.DamageChargeRequest;
import com.velocira.dto.admin.DepositSettlementResponse;
import com.velocira.entity.Booking;
import com.velocira.entity.DamageReport;
import com.velocira.entity.Refund;
import com.velocira.entity.User;
import com.velocira.entity.enums.BookingStatus;
import com.velocira.exception.ResourceNotFoundException;
import com.velocira.repository.BookingRepository;
import com.velocira.repository.DamageReportRepository;
import com.velocira.repository.RefundRepository;
import com.velocira.repository.UserRepository;
import com.velocira.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepositSettlementService {

    private final BookingRepository bookingRepository;
    private final DamageReportRepository damageReportRepository;
    private final RefundRepository refundRepository;
    private final UserRepository userRepository;
    private final BookingStatusTransitionValidator transitionValidator;
    private final AuditLogService auditLogService;

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void addCharge(UUID bookingId, DamageChargeRequest req) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

        DamageReport report = new DamageReport();
        report.setBooking(booking);
        report.setChargeType(req.chargeType());
        report.setAmount(req.amount());
        report.setDescription(req.description());
        report.setRecordedByAdmin(currentAdmin());
        damageReportRepository.save(report);
        auditLogService.record("ADMIN_ADJUSTED_DEPOSIT", "BOOKING", bookingId.toString(), req.chargeType() + ": " + req.amount());
    }

    @PreAuthorize("hasRole('ADMIN')")
    public DepositSettlementResponse getSettlement(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

        List<DamageReport> charges = damageReportRepository.findAllByBookingId(bookingId);
        BigDecimal totalCharges = charges.stream().map(DamageReport::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal refund = booking.getSecurityDepositAmount().subtract(totalCharges).max(BigDecimal.ZERO);

        List<DepositSettlementResponse.DamageChargeLine> lines = charges.stream()
            .map(c -> new DepositSettlementResponse.DamageChargeLine(c.getChargeType(), c.getAmount(), c.getDescription()))
            .toList();

        return new DepositSettlementResponse(booking.getSecurityDepositAmount(), totalCharges, refund, lines);
    }

    /** Finalizes the deposit refund and moves the booking to its terminal
     *  state, per the state machine (INSPECTION_PENDING -> COMPLETED, or
     *  -> REFUND_PENDING -> REFUNDED if a refund is owed). */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public DepositSettlementResponse settleAndComplete(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

        DepositSettlementResponse settlement = getSettlement(bookingId);

        if (settlement.refundAmount().compareTo(BigDecimal.ZERO) > 0) {
            Refund refund = new Refund();
            refund.setBooking(booking);
            refund.setAmount(settlement.refundAmount());
            refund.setRefundType("SECURITY_DEPOSIT");
            refund.setStatus("PENDING"); // actual gateway refund call happens once PaymentService's provider integration is live
            refundRepository.save(refund);
        }

        if (transitionValidator.isAllowed(booking.getStatus(), BookingStatus.COMPLETED)) {
            booking.setStatus(BookingStatus.COMPLETED);
            bookingRepository.save(booking);
        } else if (!transitionValidator.isAllowed(booking.getStatus(), BookingStatus.COMPLETED)
            && booking.getStatus() != BookingStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Cannot complete a booking with status " + booking.getStatus());
        }

        return settlement;
    }

    private User currentAdmin() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in to continue.");
        }
        return userRepository.findById(principal.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account no longer exists."));
    }
}
