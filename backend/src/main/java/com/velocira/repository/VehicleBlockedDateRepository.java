package com.velocira.repository;

import com.velocira.entity.VehicleBlockedDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface VehicleBlockedDateRepository extends JpaRepository<VehicleBlockedDate, UUID> {

    @Query("""
        SELECT bd FROM VehicleBlockedDate bd
        WHERE bd.car.id = :carId
          AND bd.startsAt < :requestedEnd
          AND bd.endsAt > :requestedStart
    """)
    List<VehicleBlockedDate> findOverlapping(
        @Param("carId") UUID carId,
        @Param("requestedStart") Instant requestedStart,
        @Param("requestedEnd") Instant requestedEnd
    );
}
