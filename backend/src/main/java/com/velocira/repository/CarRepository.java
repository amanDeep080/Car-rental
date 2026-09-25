package com.velocira.repository;

import com.velocira.entity.Car;
import com.velocira.entity.enums.CarStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.Instant;

public interface CarRepository extends JpaRepository<Car, UUID>, JpaSpecificationExecutor<Car> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Car c WHERE c.id = :id")
    Optional<Car> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") UUID id);
    
    @Query("SELECT c FROM Car c JOIN FETCH c.location WHERE c.slug = :slug AND c.deletedAt IS NULL")
    Optional<Car> findBySlugWithDetails(String slug);

    @Query("SELECT c FROM Car c JOIN FETCH c.location WHERE c.deletedAt IS NULL")
    List<Car> findAllWithDetails();

    Optional<Car> findBySlugAndDeletedAtIsNull(String slug);
    long countByStatus(CarStatus status);
    boolean existsBySlugAndDeletedAtIsNull(String slug);

    @Query(value = """
        SELECT COUNT(DISTINCT car_id) FROM bookings
        WHERE status IN ('CONFIRMED', 'READY_FOR_PICKUP', 'ACTIVE', 'RETURNED', 'INSPECTION_PENDING')
          AND pickup_at <= :at AND return_at > :at
    """, nativeQuery = true)
    long countCurrentlyBooked(@org.springframework.data.repository.query.Param("at") Instant at);
}
