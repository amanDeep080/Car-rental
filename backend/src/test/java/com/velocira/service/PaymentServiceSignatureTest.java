package com.velocira.service;

import com.velocira.config.PaymentProperties;
import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import static org.junit.jupiter.api.Assertions.*;

class PaymentServiceSignatureTest {

    private static final String SECRET = "test-webhook-secret-value";

    private PaymentService newService(String webhookSecret) {
        PaymentProperties props = new PaymentProperties("razorpay", "key_test", "api_key_test", webhookSecret);
        // Repositories/validator are unused by isSignatureValid — safe to pass null here.
        return new PaymentService(null, null, null, null, props);
    }

    private String computeValidSignature(String body, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(body.getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void acceptsACorrectlySignedPayload() throws Exception {
        PaymentService service = newService(SECRET);
        String body = "{\"event\":\"payment.captured\",\"payload\":{}}";
        String signature = computeValidSignature(body, SECRET);

        assertTrue(service.isSignatureValid(body, signature));
    }

    @Test
    void rejectsAnIncorrectSignature() {
        PaymentService service = newService(SECRET);
        String body = "{\"event\":\"payment.captured\"}";

        assertFalse(service.isSignatureValid(body, "0000000000000000000000000000000000000000000000000000000000000000"));
    }

    @Test
    void rejectsWhenBodyWasTamperedWithAfterSigning() throws Exception {
        PaymentService service = newService(SECRET);
        String originalBody = "{\"amount\":1000}";
        String signature = computeValidSignature(originalBody, SECRET);

        String tamperedBody = "{\"amount\":9999999}";

        assertFalse(service.isSignatureValid(tamperedBody, signature));
    }

    @Test
    void rejectsWhenSignatureHeaderIsMissing() {
        PaymentService service = newService(SECRET);
        assertFalse(service.isSignatureValid("{}", null));
    }

    @Test
    void rejectsWhenWebhookSecretIsNotConfigured() throws Exception {
        PaymentService service = newService(""); // simulates PAYMENT_WEBHOOK_SECRET unset
        String body = "{}";
        String signature = computeValidSignature(body, SECRET);

        assertFalse(service.isSignatureValid(body, signature));
    }

    @Test
    void signatureVerificationIsSecretSpecific() throws Exception {
        // A signature valid for one secret must not validate against a
        // service configured with a different secret — catches the case
        // where a webhook signed with an old/rotated secret is replayed.
        PaymentService service = newService("a-completely-different-secret");
        String body = "{\"event\":\"payment.captured\"}";
        String signature = computeValidSignature(body, SECRET);

        assertFalse(service.isSignatureValid(body, signature));
    }
}
