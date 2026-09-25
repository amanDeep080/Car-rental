package com.velocira.dto.lookup;

import java.math.BigDecimal;
import java.util.UUID;

public record AddonDto(UUID id, String name, String description, BigDecimal price, String pricingType) {}
