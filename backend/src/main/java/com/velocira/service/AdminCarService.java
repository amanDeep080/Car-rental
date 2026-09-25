package com.velocira.service;

import com.velocira.dto.admin.AdminCarUpsertRequest;
import com.velocira.dto.car.CarDetailDto;
import com.velocira.entity.Car;
import com.velocira.entity.CarImage;
import com.velocira.entity.Location;
import com.velocira.entity.enums.CarStatus;
import com.velocira.entity.enums.FuelType;
import com.velocira.entity.enums.Transmission;
import com.velocira.exception.ResourceNotFoundException;
import com.velocira.mapper.CarMapper;
import com.velocira.repository.CarRepository;
import com.velocira.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCarService {

    private final CarRepository carRepository;
    private final LocationRepository locationRepository;
    private final CarMapper carMapper;
    private final AuditLogService auditLogService;

    // Method-level authorization in addition to the SecurityConfig gateway
    // rule on /api/admin/** — defense in depth per spec §52.
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public CarDetailDto createCar(AdminCarUpsertRequest req) {
        if (carRepository.existsBySlugAndDeletedAtIsNull(req.slug())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A car with this slug already exists.");
        }
        Car car = new Car();
        applyRequest(car, req);
        Car saved = carRepository.save(car);
        auditLogService.record("ADMIN_ADDED_VEHICLE", "CAR", saved.getId().toString(), saved.getBrand() + " " + saved.getModel());
        return carMapper.toDetail(saved, 0.0, 0);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public CarDetailDto updateCar(UUID id, AdminCarUpsertRequest req) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Car not found."));
        applyRequest(car, req);
        Car saved = carRepository.save(car);
        auditLogService.record("ADMIN_UPDATED_VEHICLE", "CAR", saved.getId().toString(), "price/day now " + saved.getPricePerDay());
        return carMapper.toDetail(saved, 0.0, 0);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deactivateCar(UUID id) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Car not found."));
        car.setStatus(CarStatus.INACTIVE);
        carRepository.save(car);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void softDeleteCar(UUID id) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Car not found."));
        car.setDeletedAt(Instant.now());
        car.setStatus(CarStatus.INACTIVE);
        carRepository.save(car);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<CarDetailDto> listAll() {
        return carRepository.findAllWithDetails().stream()
            .map(c -> carMapper.toDetail(c, 0.0, 0))
            .toList();
    }

    private void applyRequest(Car car, AdminCarUpsertRequest req) {
        Location location = locationRepository.findById(req.locationId())
            .orElseThrow(() -> new ResourceNotFoundException("Location not found."));

        car.setSlug(req.slug());
        car.setBrand(req.brand());
        car.setModel(req.model());
        car.setVariant(req.variant());
        car.setYear(req.year());
        car.setRegistrationNumber(req.registrationNumber());
        car.setCategory(req.category());
        car.setFuel(FuelType.valueOf(req.fuel()));
        car.setTransmission(Transmission.valueOf(req.transmission()));
        car.setSeats(req.seats());
        car.setDoors(req.doors());
        car.setEngine(req.engine());
        car.setPower(req.power());
        car.setMileagePolicy(req.mileagePolicy());
        car.setPricePerDay(req.pricePerDay());
        car.setPricePerSixHours(req.pricePerSixHours());
        car.setPricePerTwelveHours(req.pricePerTwelveHours());

        BigDecimal twentyFourHourRate = req.pricePerTwentyFourHours() != null && req.pricePerTwentyFourHours().compareTo(BigDecimal.ZERO) > 0
            ? req.pricePerTwentyFourHours()
            : req.pricePerDay();
        car.setPricePerTwentyFourHours(twentyFourHourRate);
        car.setPricePerWeek(req.pricePerWeek());
        car.setPricePerMonth(req.pricePerMonth());
        car.setSecurityDeposit(req.securityDeposit() != null ? req.securityDeposit() : BigDecimal.ZERO);
        car.setLocation(location);
        car.setStatus(req.status() != null ? CarStatus.valueOf(req.status()) : car.getStatus());
        car.setDescription(req.description());
        car.setRentalPolicy(req.rentalPolicy());

        car.getFeatures().clear();
        if (req.features() != null) car.getFeatures().addAll(req.features());

        if (req.imageUrls() != null) {
            car.getImages().clear();
            List<CarImage> images = new ArrayList<>();
            int order = 0;
            for (String url : req.imageUrls()) {
                CarImage img = new CarImage();
                img.setCar(car);
                img.setUrl(url);
                img.setSortOrder(order++);
                images.add(img);
            }
            car.getImages().addAll(images);
        }
    }
}
