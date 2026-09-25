package com.velocira.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.payment")
public record PaymentProperties(String provider, String keyId, String apiKey, String webhookSecret) {}
