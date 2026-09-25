package com.velocira.mapper;

import com.velocira.dto.car.CarDetailDto;
import com.velocira.dto.car.CarSummaryDto;
import com.velocira.entity.Car;
import com.velocira.entity.CarImage;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.time.Instant;

@Component
public class CarMapper {

    public CarSummaryDto toSummary(Car car, double rating, int reviewCount) {
        // Eagerly evaluate images for primary image selection
        String primaryImage = "https://placehold.co/600x400?text=No+Vehicle+Image";
        if (car.getImages() != null && !car.getImages().isEmpty()) {
            primaryImage = car.getImages().stream()
                .min(Comparator.comparing(CarImage::getSortOrder))
                .map(CarImage::getUrl)
                .orElse("https://placehold.co/600x400?text=No+Vehicle+Image");
        }

        return new CarSummaryDto(
            car.getId(),
            car.getSlug(),
            car.getBrand(),
            car.getModel(),
            car.getVariant(),
            car.getYear(),
            car.getCategory(),
            primaryImage,
            rating,
            reviewCount,
            car.getPricePerDay(),
            car.getTransmission().name(),
            car.getFuel().name(),
            car.getSeats(),
            car.getLocation().getCity(),
            car.getStatus().name()
        );
    }

    public CarDetailDto toDetail(Car car, double rating, int reviewCount) {
        return toDetail(car, rating, reviewCount, false, null);
    }

    public CarDetailDto toDetail(Car car, double rating, int reviewCount, boolean currentlyBooked, Instant bookedUntil) {
        // Eagerly evaluate images to avoid LazyInitializationException during JSON serialization
        List<String> imageUrls = new ArrayList<>();
        if (car.getImages() != null) {
            car.getImages().stream()
                .sorted(Comparator.comparing(CarImage::getSortOrder))
                .forEach(img -> imageUrls.add(img.getUrl()));
        }

        // Eagerly evaluate features to avoid LazyInitializationException during JSON serialization
        List<String> features = new ArrayList<>();
        if (car.getFeatures() != null) {
            features.addAll(car.getFeatures());
        }

        return new CarDetailDto(
            car.getId(),
            car.getSlug(),
            car.getBrand(),
            car.getModel(),
            car.getVariant(),
            car.getYear(),
            car.getCategory(),
            car.getFuel().name(),
            car.getTransmission().name(),
            car.getSeats(),
            car.getDoors(),
            car.getEngine(),
            car.getPower(),
            car.getMileagePolicy(),
            car.getPricePerSixHours(),
            car.getPricePerTwelveHours(),
            car.getPricePerTwentyFourHours(),
            car.getPricePerDay(),
            car.getPricePerWeek(),
            car.getPricePerMonth(),
            car.getSecurityDeposit(),
            car.getLocation().getId(),
            car.getLocation().getCity(),
            car.getStatus().name(),
            car.getDescription(),
            car.getRentalPolicy(),
            features,
            imageUrls,
            rating,
            reviewCount,
            currentlyBooked,
            bookedUntil
        );
    }
}
