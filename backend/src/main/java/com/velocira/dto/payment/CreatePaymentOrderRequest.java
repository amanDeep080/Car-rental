package com.velocira.dto.payment;

import jakarta.validation.constraints.NotBlank;

public record CreatePaymentOrderRequest(@NotBlank String bookingReference) {}
