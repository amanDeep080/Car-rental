package com.velocira.dto.payment;

import java.math.BigDecimal;

public record CreatePaymentOrderResponse(
    String gatewayOrderId,
    String razorpayKeyId, // public key — safe to expose to the frontend Checkout widget
    BigDecimal amount,
    String currency,
    String bookingReference
) {}
