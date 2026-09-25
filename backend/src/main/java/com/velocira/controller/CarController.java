package com.velocira.controller;

import com.velocira.dto.car.CarDetailDto;
import com.velocira.dto.car.CarSearchRequest;
import com.velocira.dto.car.CarSummaryDto;
import com.velocira.service.CarService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;

    @GetMapping
    public ResponseEntity<List<CarSummaryDto>> search(
        @RequestParam(required = false) String location,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant pickupAt,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant returnAt,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String brand,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) String transmission,
        @RequestParam(required = false) String fuel,
        @RequestParam(required = false) Integer minSeats,
        @RequestParam(required = false, defaultValue = "RECOMMENDED") String sort
    ) {
        CarSearchRequest req = new CarSearchRequest(
            location, pickupAt, returnAt, category, brand, minPrice, maxPrice, transmission, fuel, minSeats, sort
        );
        return ResponseEntity.ok(carService.search(req));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<CarDetailDto> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(carService.getBySlug(slug));
    }
}
