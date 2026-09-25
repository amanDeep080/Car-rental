package com.velocira.repository;

import com.velocira.entity.VehicleInspection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VehicleInspectionRepository extends JpaRepository<VehicleInspection, UUID> {
    List<VehicleInspection> findAllByBookingId(UUID bookingId);
    Optional<VehicleInspection> findByBookingIdAndInspectionType(UUID bookingId, String inspectionType);
}
