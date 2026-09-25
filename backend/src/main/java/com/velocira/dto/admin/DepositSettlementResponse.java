package com.velocira.dto.admin;

import java.math.BigDecimal;
import java.util.List;

public record DepositSettlementResponse(
    BigDecimal originalDeposit,
    BigDecimal totalCharges,
    BigDecimal refundAmount,
    List<DamageChargeLine> charges
) {
    public record DamageChargeLine(String chargeType, BigDecimal amount, String description) {}
}
