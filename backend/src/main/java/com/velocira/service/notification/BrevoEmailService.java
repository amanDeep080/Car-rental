package com.velocira.service.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class BrevoEmailService {

    @Value("${app.brevo.api-key:}")
    private String apiKey;

    @Value("${app.brevo.sender-email:no-reply@wheelsonrentals.com}")
    private String senderEmail;

    @Value("${app.brevo.sender-name:Wheels On Rentals}")
    private String senderName;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendOtpEmail(String toEmail, String fullName, String otp) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Brevo API key is not configured. Skipping email to {}", toEmail);
            log.info("OTP for {}: {}", toEmail, otp);
            return;
        }

        String url = "https://api.brevo.com/v3/smtp/email";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);

        Map<String, Object> body = Map.of(
            "sender", Map.of("name", senderName, "email", senderEmail),
            "to", List.of(Map.of("email", toEmail, "name", fullName)),
            "subject", "Your Verification Code - Wheels On Rentals",
            "htmlContent", "<html><body><h1>Hello " + fullName + "</h1><p>Your verification code is: <strong>" + otp + "</strong></p><p>This code will expire in 10 minutes.</p></body></html>"
        );

        try {
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            var response = restTemplate.postForEntity(url, request, String.class);
            log.info("OTP email sent successfully to {}. Status: {}", toEmail, response.getStatusCode());
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("Brevo API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Failed to send OTP email via Brevo: {}", e.getMessage());
        }
    }

    public void sendPasswordResetEmail(String toEmail, String fullName, String resetLink) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Brevo API key is not configured. Skipping password reset email to {}", toEmail);
            return;
        }

        String url = "https://api.brevo.com/v3/smtp/email";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);

        Map<String, Object> body = Map.of(
            "sender", Map.of("name", senderName, "email", senderEmail),
            "to", List.of(Map.of("email", toEmail, "name", fullName)),
            "subject", "Reset your Wheels On Rentals password",
            "htmlContent", "<html><body><h1>Hello " + fullName + "</h1>"
                + "<p>Use the link below within 30 minutes to reset your password:</p>"
                + "<p><a href=\"" + resetLink + "\">Reset password</a></p>"
                + "<p>If you did not request this, you can safely ignore this email.</p></body></html>"
        );

        try {
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            var response = restTemplate.postForEntity(url, request, String.class);
            log.info("Password reset email sent successfully to {}. Status: {}", toEmail, response.getStatusCode());
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("Brevo API error while sending password reset email: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Failed to send password reset email via Brevo: {}", e.getMessage());
        }
    }
}
