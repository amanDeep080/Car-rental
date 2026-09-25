package com.velocira.repository;

import com.velocira.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    boolean existsByBookingId(UUID bookingId);
    List<Review> findAllByCarIdAndModerationStatusOrderByCreatedAtDesc(UUID carId, String moderationStatus);
    Optional<Review> findByBookingId(UUID bookingId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT COALESCE(AVG(r.overallRating), 0) FROM Review r WHERE r.car.id = :carId AND r.moderationStatus = 'PUBLISHED'")
    double averageRatingForCar(@org.springframework.data.repository.query.Param("carId") UUID carId);

    long countByCarIdAndModerationStatus(UUID carId, String moderationStatus);
}
