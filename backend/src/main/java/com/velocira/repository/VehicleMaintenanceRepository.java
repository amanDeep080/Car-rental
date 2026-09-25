package com.velocira.repository;

import com.velocira.entity.VehicleMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface VehicleMaintenanceRepository extends JpaRepository<VehicleMaintenance, UUID> {

    @Query("""
        SELECT m FROM VehicleMaintenance m
        WHERE m.car.id = :carId
          AND m.startsAt < :requestedEnd
          AND (m.endsAt IS NULL OR m.endsAt > :requestedStart)
    """)
    List<VehicleMaintenance> findOverlapping(
        @Param("carId") UUID carId,
        @Param("requestedStart") Instant requestedStart,
        @Param("requestedEnd") Instant requestedEnd
    );
}
