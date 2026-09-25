package com.velocira.service;

import com.velocira.entity.Booking;
import com.velocira.entity.DamageReport;
import com.velocira.repository.BookingRepository;
import com.velocira.repository.DamageReportRepository;
import com.velocira.repository.RefundRepository;
import com.velocira.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DepositSettlementServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private DamageReportRepository damageReportRepository;
    @Mock private RefundRepository refundRepository;
    @Mock private UserRepository userRepository;
    @Mock private BookingStatusTransitionValidator transitionValidator;
    @Mock private AuditLogService auditLogService;

    private DepositSettlementService settlementService;
    private Booking booking;
    private UUID bookingId;

    @BeforeEach
    void setUp() {
        settlementService = new DepositSettlementService(
            bookingRepository, damageReportRepository, refundRepository, userRepository, transitionValidator, auditLogService
        );
        bookingId = UUID.randomUUID();
        booking = new Booking();
        booking.setId(bookingId);
        booking.setSecurityDepositAmount(new BigDecimal("5000"));
    }

    @Test
    void refundsFullDepositWhenNoChargesRecorded() {
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(damageReportRepository.findAllByBookingId(bookingId)).thenReturn(List.of());

        var settlement = settlementService.getSettlement(bookingId);

        assertEquals(0, new BigDecimal("5000").compareTo(settlement.refundAmount()));
        assertEquals(0, BigDecimal.ZERO.compareTo(settlement.totalCharges()));
    }

    @Test
    void subtractsChargesFromDepositToComputeRefund() {
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        DamageReport damage = new DamageReport();
        damage.setChargeType("DAMAGE");
        damage.setAmount(new BigDecimal("1200"));

        DamageReport lateFee = new DamageReport();
        lateFee.setChargeType("LATE_RETURN");
        lateFee.setAmount(new BigDecimal("300"));

        when(damageReportRepository.findAllByBookingId(bookingId)).thenReturn(List.of(damage, lateFee));

        var settlement = settlementService.getSettlement(bookingId);

        // 5000 deposit - (1200 + 300) charges = 3500 refund
        assertEquals(0, new BigDecimal("1500").compareTo(settlement.totalCharges()));
        assertEquals(0, new BigDecimal("3500").compareTo(settlement.refundAmount()));
    }

    @Test
    void refundNeverGoesNegativeWhenChargesExceedDeposit() {
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        DamageReport majorDamage = new DamageReport();
        majorDamage.setChargeType("DAMAGE");
        majorDamage.setAmount(new BigDecimal("8000")); // exceeds the 5000 deposit

        when(damageReportRepository.findAllByBookingId(bookingId)).thenReturn(List.of(majorDamage));

        var settlement = settlementService.getSettlement(bookingId);

        // Refund is floored at zero — the customer is never shown a
        // negative refund from this endpoint. (Recovering the shortfall
        // beyond the deposit is a separate, out-of-band collections
        // concern, not something this calculation should imply.)
        assertEquals(0, BigDecimal.ZERO.compareTo(settlement.refundAmount()));
    }
}
