package com.velocira.service;

import com.velocira.dto.maintenance.MaintenanceCreateRequest;
import com.velocira.dto.maintenance.MaintenanceResponse;
import com.velocira.entity.Car;
import com.velocira.entity.VehicleMaintenance;
import com.velocira.entity.enums.CarStatus;
import com.velocira.exception.ResourceNotFoundException;
import com.velocira.repository.CarRepository;
import com.velocira.repository.VehicleMaintenanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminMaintenanceService {

    private final VehicleMaintenanceRepository maintenanceRepository;
    private final CarRepository carRepository;
    private final AuditLogService auditLogService;

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public MaintenanceResponse create(MaintenanceCreateRequest req) {
        Car car = carRepository.findById(req.carId())
            .orElseThrow(() -> new ResourceNotFoundException("Car not found."));

        VehicleMaintenance m = new VehicleMaintenance();
        m.setCar(car);
        m.setServiceType(req.serviceType());
        m.setStartsAt(req.startsAt());
        m.setEndsAt(req.endsAt());
        m.setMileageAtService(req.mileageAtService());
        m.setCost(req.cost());
        m.setNotes(req.notes());
        m.setNextServiceDate(req.nextServiceDate());
        m.setNextServiceMileage(req.nextServiceMileage());
        VehicleMaintenance saved = maintenanceRepository.save(m);

        // An open-ended or currently-active maintenance window blocks the
        // vehicle immediately (spec §28) — the availability engine already
        // checks vehicle_maintenance overlaps, but flip the status too so
        // it's reflected everywhere car status is surfaced (fleet lists,
        // admin table) without a separate join.
        boolean coversNow = !req.startsAt().isAfter(Instant.now())
            && (req.endsAt() == null || req.endsAt().isAfter(Instant.now()));
        if (coversNow) {
            car.setStatus(CarStatus.MAINTENANCE);
            carRepository.save(car);
        }

        auditLogService.record("ADMIN_ADDED_MAINTENANCE", "CAR", car.getId().toString(), req.serviceType());
        return toResponse(saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void complete(UUID maintenanceId) {
        VehicleMaintenance m = maintenanceRepository.findById(maintenanceId)
            .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found."));
        m.setEndsAt(Instant.now());
        maintenanceRepository.save(m);

        Car car = m.getCar();
        if (car.getStatus() == CarStatus.MAINTENANCE) {
            car.setStatus(CarStatus.AVAILABLE);
            carRepository.save(car);
        }
        auditLogService.record("ADMIN_COMPLETED_MAINTENANCE", "CAR", car.getId().toString(), m.getServiceType());
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<MaintenanceResponse> listForCar(UUID carId) {
        return maintenanceRepository.findAll().stream()
            .filter(m -> m.getCar().getId().equals(carId))
            .map(this::toResponse)
            .toList();
    }

    private MaintenanceResponse toResponse(VehicleMaintenance m) {
        return new MaintenanceResponse(
            m.getId(), m.getCar().getId(),
            m.getCar().getBrand() + " " + m.getCar().getModel() + " " + m.getCar().getVariant(),
            m.getServiceType(), m.getStartsAt(), m.getEndsAt(), m.getMileageAtService(),
            m.getCost(), m.getNotes(), m.getNextServiceDate(), m.getNextServiceMileage()
        );
    }
}
