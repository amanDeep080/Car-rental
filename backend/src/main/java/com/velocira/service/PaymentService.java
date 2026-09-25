package com.velocira.service;

import com.velocira.config.PaymentProperties;
import com.velocira.dto.payment.CreatePaymentOrderRequest;
import com.velocira.dto.payment.CreatePaymentOrderResponse;
import com.velocira.entity.Booking;
import com.velocira.entity.Payment;
import com.velocira.entity.PaymentTransaction;
import com.velocira.entity.enums.BookingStatus;
import com.velocira.entity.enums.PaymentStatus;
import com.velocira.exception.ResourceNotFoundException;
import com.velocira.repository.BookingRepository;
import com.velocira.repository.PaymentRepository;
import com.velocira.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final BookingRepository bookingRepository;
    // Kept as a constructor dependency for whoever implements the webhook
    // payload parsing below — the eventual booking transition to CONFIRMED
    // must go through this validator, same as every other status change.
    private final BookingStatusTransitionValidator transitionValidator;
    private final PaymentProperties paymentProperties;

    private final RestClient restClient = RestClient.create("https://api.razorpay.com/v1");

    /**
     * Creates a Razorpay order for the booking's total payable amount and
     * records a local Payment row in INITIATED state. Returns the public
     * key + order id the frontend needs to open Razorpay Checkout — never
     * the secret key.
     *
     * NOTE ON THIS ENVIRONMENT: this calls out to api.razorpay.com, which
     * requires PAYMENT_API_KEY/PAYMENT_KEY_ID to be configured with real
     * Razorpay credentials. It could not be exercised end-to-end in the
     * sandbox this was built in (no outbound network access to Razorpay,
     * no test credentials) — the HTTP call shape follows Razorpay's
     * documented Orders API, but you should smoke-test it against a real
     * (test-mode) Razorpay account before going live.
     */
    @Transactional
    public CreatePaymentOrderResponse createOrder(CreatePaymentOrderRequest req) {
        Booking booking = bookingRepository.findByBookingReference(req.bookingReference())
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

        if (booking.getStatus() != BookingStatus.AWAITING_PAYMENT
            && booking.getStatus() != BookingStatus.AWAITING_VERIFICATION) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "This booking is not awaiting payment (status: " + booking.getStatus() + ").");
        }

        // Amount is read from the booking record computed server-side at
        // creation time — never accepted from the request body.
        long amountInPaise = booking.getTotalPayable().movePointRight(2).longValueExact();

        Map<String, Object> orderRequest = Map.of(
            "amount", amountInPaise,
            "currency", "INR",
            "receipt", booking.getBookingReference(),
            "notes", Map.of("bookingId", booking.getId().toString())
        );

        String gatewayOrderId;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                .uri("/orders")
                .headers(h -> h.setBasicAuth(paymentProperties.keyId(), paymentProperties.apiKey()))
                .body(orderRequest)
                .retrieve()
                .body(Map.class);
            gatewayOrderId = response == null ? null : String.valueOf(response.get("id"));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Could not reach the payment provider. Please try again.");
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getTotalPayable());
        payment.setGatewayOrderId(gatewayOrderId);
        payment.setStatus(PaymentStatus.INITIATED);
        Payment saved = paymentRepository.save(payment);

        logTransaction(saved, "ORDER_CREATED", null, PaymentStatus.INITIATED.name());

        return new CreatePaymentOrderResponse(
            gatewayOrderId, paymentProperties.keyId(), booking.getTotalPayable(), "INR", booking.getBookingReference()
        );
    }

    /**
     * Handles Razorpay's payment webhook. This is the ONLY place a booking
     * is allowed to move from AWAITING_PAYMENT to CONFIRMED — a frontend
     * "payment succeeded" callback is never trusted on its own (spec §23).
     * Verifies the HMAC-SHA256 signature Razorpay sends in the
     * X-Razorpay-Signature header against the raw request body before
     * touching anything.
     *
     * NOTE: signature verification below is fully implemented and unit
     * -testable independent of a live gateway. Payload parsing (pulling
     * order id / payment id / event type out of the verified JSON body) is
     * left as a structural stub — there is no live Razorpay webhook to
     * exercise it against in this environment, and guessing at the exact
     * field path risks shipping something that looks done but silently
     * mis-parses a real payload. Wire in a proper JSON parse of
     * event.payload.payment.entity.{order_id,id,status} here before going
     * live, then call confirmBookingAfterPayment(booking).
     */
    @Transactional
    public void handleWebhook(String rawBody, String signatureHeader) {
        if (!isSignatureValid(rawBody, signatureHeader)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid webhook signature.");
        }
        throw new UnsupportedOperationException(
            "Webhook signature verified — payload parsing needs a real Razorpay webhook payload to implement against safely."
        );
    }

    /** Real HMAC-SHA256 verification against the configured webhook secret. */
    boolean isSignatureValid(String rawBody, String signatureHeader) {
        if (signatureHeader == null || paymentProperties.webhookSecret() == null || paymentProperties.webhookSecret().isBlank()) {
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(paymentProperties.webhookSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] computed = mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));
            String computedHex = HexFormat.of().formatHex(computed);
            return MessageDigest.isEqual(
                computedHex.getBytes(StandardCharsets.UTF_8),
                signatureHeader.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception ex) {
            return false;
        }
    }

    private void logTransaction(Payment payment, String eventType, String rawPayload, String resultingStatus) {
        PaymentTransaction tx = new PaymentTransaction();
        tx.setPayment(payment);
        tx.setEventType(eventType);
        tx.setRawPayload(rawPayload);
        tx.setResultingStatus(resultingStatus);
        transactionRepository.save(tx);
    }
}
