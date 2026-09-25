package com.velocira.service;

import com.velocira.dto.car.CarDetailDto;
import com.velocira.dto.car.CarSearchRequest;
import com.velocira.dto.car.CarSummaryDto;
import com.velocira.entity.Car;
import com.velocira.exception.ResourceNotFoundException;
import com.velocira.mapper.CarMapper;
import com.velocira.repository.CarRepository;
import com.velocira.repository.ReviewRepository;
import com.velocira.repository.spec.CarSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CarService {

    private final CarRepository carRepository;
    private final CarMapper carMapper;
    private final AvailabilityService availabilityService;
    private final ReviewRepository reviewRepository;

    public List<CarSummaryDto> search(CarSearchRequest req) {
        Specification<Car> spec = Specification
            .where(CarSpecifications.notDeleted())
            .and(CarSpecifications.notInactive())
            .and(CarSpecifications.locationCity(req.location()))
            .and(CarSpecifications.category(req.category()))
            .and(CarSpecifications.brand(req.brand()))
            .and(CarSpecifications.transmission(req.transmission()))
            .and(CarSpecifications.fuel(req.fuel()))
            .and(CarSpecifications.minSeats(req.minSeats()))
            .and(CarSpecifications.priceBetween(req.minPrice(), req.maxPrice()));

        Sort sort = switch (req.sort() == null ? "RECOMMENDED" : req.sort()) {
            case "PRICE_LOW" -> Sort.by("pricePerDay").ascending();
            case "PRICE_HIGH" -> Sort.by("pricePerDay").descending();
            case "NEWEST" -> Sort.by("year").descending();
            // RATING and RECOMMENDED fall back to newest-first until the
            // reviews aggregate (avg rating, review count) lands in Phase 17.
            default -> Sort.by("createdAt").descending();
        };

        List<Car> cars = carRepository.findAll(spec, sort);

        // If the customer specified a pickup/return window, filter out cars
        // that are not actually available for it — never show a bookable
        // card for a car the availability engine would reject.
        if (req.pickupAt() != null && req.returnAt() != null) {
            cars = cars.stream()
                .filter(car -> availabilityService.isAvailable(car, req.pickupAt(), req.returnAt()))
                .toList();
        }

        return cars.stream()
            // N+1 queries here — acceptable at seed-data scale (15 cars);
            // replace with a single batched GROUP BY query (car_id, AVG(rating),
            // COUNT(*)) before this fleet grows past a page of results.
            .map(car -> carMapper.toSummary(
                car,
                reviewRepository.averageRatingForCar(car.getId()),
                (int) reviewRepository.countByCarIdAndModerationStatus(car.getId(), "PUBLISHED")
            ))
            .toList();
    }

    public CarDetailDto getBySlug(String slug) {
        Car car = carRepository.findBySlugWithDetails(slug)
            .orElseThrow(() -> new ResourceNotFoundException("No car found for slug: " + slug));
        var nextBooking = availabilityService.nextBlockingBooking(car.getId(), Instant.now());
        return carMapper.toDetail(
            car,
            reviewRepository.averageRatingForCar(car.getId()),
            (int) reviewRepository.countByCarIdAndModerationStatus(car.getId(), "PUBLISHED"),
            nextBooking.isPresent(),
            nextBooking.map(com.velocira.entity.Booking::getReturnAt).orElse(null)
        );
    }
}
