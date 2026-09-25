package com.velocira.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.math.BigDecimal;

@ConfigurationProperties(prefix = "app.business")
public record BusinessProperties(
    String currency,
    int minRentalHours,
    int maxRentalDays,
    BigDecimal taxRatePercent
) {}
