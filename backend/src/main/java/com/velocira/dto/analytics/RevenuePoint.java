package com.velocira.dto.analytics;

import java.math.BigDecimal;

public record RevenuePoint(String period, BigDecimal revenue, long bookingCount) {}
