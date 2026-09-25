package com.velocira.controller;

import com.velocira.dto.payment.CreatePaymentOrderRequest;
import com.velocira.dto.payment.CreatePaymentOrderResponse;
import com.velocira.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<CreatePaymentOrderResponse> create(@Valid @RequestBody CreatePaymentOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createOrder(request));
    }

    // Public endpoint (see SecurityConfig) — authenticity is established by
    // the HMAC signature check inside PaymentService, not by a JWT, since
    // this is called by Razorpay's servers, not a logged-in browser.
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
        @RequestBody String rawBody,
        @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature
    ) {
        paymentService.handleWebhook(rawBody, signature);
        return ResponseEntity.ok().build();
    }
}
