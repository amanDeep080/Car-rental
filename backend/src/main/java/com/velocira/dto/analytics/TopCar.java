package com.velocira.dto.analytics;

import java.math.BigDecimal;
import java.util.UUID;

public record TopCar(UUID carId, String label, long bookingCount, BigDecimal revenue) {}
