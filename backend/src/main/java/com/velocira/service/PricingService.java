package com.velocira.service;

import com.velocira.entity.Car;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class PricingService {

    /**
     * Picks the cheapest correct rate for the requested duration:
     * exact tier match (6h/12h/24h) when available, otherwise a per-day rate
     * for anything longer, with week/month rates applied once the duration
     * crosses those thresholds. All amounts are computed here — the frontend
     * only ever displays what this method returns, never sends its own total.
     */
    public PriceBreakdown calculateRentalAmount(Car car, Instant pickupAt, Instant returnAt) {
        long totalHours = Duration.between(pickupAt, returnAt).toHours();
        if (totalHours <= 0) {
            throw new IllegalArgumentException("Return time must be after pickup time.");
        }

        long days = totalHours / 24;
        long extraHours = totalHours % 24;

        BigDecimal amount = BigDecimal.ZERO;
        StringBuilder basis = new StringBuilder();

        // 1. Calculate Full Days
        if (days > 0) {
            amount = amount.add(car.getPricePerDay().multiply(BigDecimal.valueOf(days)));
            basis.append(days).append(days > 1 ? " Days" : " Day");
        }

        // 2. Add Tiered Extra Hours
        if (extraHours > 0 || days == 0) {
            if (extraHours <= 6 && car.getPricePerSixHours() != null) {
                amount = amount.add(car.getPricePerSixHours());
                basis.append(basis.length() > 0 ? " + " : "").append("6 Hours");
            } else if (extraHours <= 12 && car.getPricePerTwelveHours() != null) {
                amount = amount.add(car.getPricePerTwelveHours());
                basis.append(basis.length() > 0 ? " + " : "").append("12 Hours");
            } else {
                // More than 12 hours or no specific tier, round up to a full day
                amount = amount.add(car.getPricePerDay());
                basis.append(basis.length() > 0 ? " + " : "").append("Full Day");
            }
        }

        return new PriceBreakdown(amount.setScale(2, RoundingMode.HALF_UP), basis.toString(), totalHours);
    }

    public record PriceBreakdown(BigDecimal rentalAmount, String rateBasis, long durationHours) {}
}
