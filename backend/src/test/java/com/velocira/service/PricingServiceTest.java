package com.velocira.service;

import com.velocira.entity.Car;
import com.velocira.entity.enums.FuelType;
import com.velocira.entity.enums.Transmission;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;

class PricingServiceTest {

    private PricingService pricingService;
    private Car car;

    @BeforeEach
    void setUp() {
        pricingService = new PricingService();

        car = new Car();
        car.setFuel(FuelType.PETROL);
        car.setTransmission(Transmission.MANUAL);
        car.setSeats(5);
        car.setPricePerSixHours(new BigDecimal("800"));
        car.setPricePerTwelveHours(new BigDecimal("1200"));
        car.setPricePerTwentyFourHours(new BigDecimal("2000"));
        car.setPricePerDay(new BigDecimal("2000"));
        car.setPricePerWeek(new BigDecimal("12000"));
        car.setPricePerMonth(new BigDecimal("42000"));
        car.setSecurityDeposit(new BigDecimal("5000"));
    }

    @Test
    void picksSixHourRate_whenDurationIsWithinSixHours() {
        Instant pickup = Instant.now();
        Instant ret = pickup.plus(5, ChronoUnit.HOURS);

        var result = pricingService.calculateRentalAmount(car, pickup, ret);

        assertEquals("6_HOUR_RATE", result.rateBasis());
        assertEquals(0, new BigDecimal("800").compareTo(result.rentalAmount()));
    }

    @Test
    void picksTwelveHourRate_whenDurationIsBetweenSixAndTwelveHours() {
        Instant pickup = Instant.now();
        Instant ret = pickup.plus(10, ChronoUnit.HOURS);

        var result = pricingService.calculateRentalAmount(car, pickup, ret);

        assertEquals("12_HOUR_RATE", result.rateBasis());
        assertEquals(0, new BigDecimal("1200").compareTo(result.rentalAmount()));
    }

    @Test
    void fallsBackToDailyRate_whenNoHourTierConfigured() {
        car.setPricePerSixHours(null);
        car.setPricePerTwelveHours(null);
        car.setPricePerTwentyFourHours(null);

        Instant pickup = Instant.now();
        Instant ret = pickup.plus(4, ChronoUnit.HOURS);

        var result = pricingService.calculateRentalAmount(car, pickup, ret);

        assertEquals("DAILY_RATE", result.rateBasis());
        // 4 hours still rounds up to 1 day billed
        assertEquals(0, new BigDecimal("2000").compareTo(result.rentalAmount()));
    }

    @Test
    void computesMultiDayRentalAtDailyRate() {
        Instant pickup = Instant.now();
        Instant ret = pickup.plus(3, ChronoUnit.DAYS);

        var result = pricingService.calculateRentalAmount(car, pickup, ret);

        assertEquals("DAILY_RATE", result.rateBasis());
        assertEquals(0, new BigDecimal("6000").compareTo(result.rentalAmount()));
    }

    @Test
    void appliesWeeklyRatePlusRemainderDays_whenSevenOrMoreDays() {
        Instant pickup = Instant.now();
        Instant ret = pickup.plus(9, ChronoUnit.DAYS); // 1 week + 2 days

        var result = pricingService.calculateRentalAmount(car, pickup, ret);

        assertEquals("WEEKLY_RATE", result.rateBasis());
        // 12000 (week) + 2 * 2000 (remainder days) = 16000
        assertEquals(0, new BigDecimal("16000").compareTo(result.rentalAmount()));
    }

    @Test
    void appliesMonthlyRate_whenThirtyOrMoreDays() {
        Instant pickup = Instant.now();
        Instant ret = pickup.plus(30, ChronoUnit.DAYS);

        var result = pricingService.calculateRentalAmount(car, pickup, ret);

        assertEquals("MONTHLY_RATE", result.rateBasis());
        assertEquals(0, new BigDecimal("42000").compareTo(result.rentalAmount()));
    }

    @Test
    void rejectsReturnTimeAtOrBeforePickupTime() {
        Instant pickup = Instant.now();

        assertThrows(IllegalArgumentException.class,
            () -> pricingService.calculateRentalAmount(car, pickup, pickup));
        assertThrows(IllegalArgumentException.class,
            () -> pricingService.calculateRentalAmount(car, pickup, pickup.minus(1, ChronoUnit.HOURS)));
    }
}
