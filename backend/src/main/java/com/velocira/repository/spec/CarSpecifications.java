package com.velocira.repository.spec;

import com.velocira.entity.Car;
import com.velocira.entity.enums.CarStatus;
import com.velocira.entity.enums.FuelType;
import com.velocira.entity.enums.Transmission;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public final class CarSpecifications {

    private CarSpecifications() {}

    public static Specification<Car> notDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    public static Specification<Car> notInactive() {
        return (root, query, cb) -> cb.notEqual(root.get("status"), CarStatus.INACTIVE);
    }

    public static Specification<Car> locationCity(String city) {
        return (root, query, cb) ->
            city == null ? null : cb.equal(cb.lower(root.get("location").get("city")), city.toLowerCase());
    }

    public static Specification<Car> category(String category) {
        return (root, query, cb) ->
            category == null ? null : cb.equal(cb.lower(root.get("category")), category.toLowerCase());
    }

    public static Specification<Car> brand(String brand) {
        return (root, query, cb) ->
            brand == null ? null : cb.equal(cb.lower(root.get("brand")), brand.toLowerCase());
    }

    public static Specification<Car> transmission(String transmission) {
        return (root, query, cb) -> {
            if (transmission == null) return null;
            try {
                return cb.equal(root.get("transmission"), Transmission.valueOf(transmission.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return null; // Ignore invalid transmission filter instead of crashing
            }
        };
    }

    public static Specification<Car> fuel(String fuel) {
        return (root, query, cb) -> {
            if (fuel == null) return null;
            try {
                return cb.equal(root.get("fuel"), FuelType.valueOf(fuel.toUpperCase()));
            } catch (IllegalArgumentException e) {
                return null; // Ignore invalid fuel filter instead of crashing
            }
        };
    }

    public static Specification<Car> minSeats(Integer seats) {
        return (root, query, cb) -> seats == null ? null : cb.greaterThanOrEqualTo(root.get("seats"), seats);
    }

    public static Specification<Car> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            if (min == null && max == null) return null;
            if (min != null && max != null) return cb.between(root.get("pricePerDay"), min, max);
            if (min != null) return cb.greaterThanOrEqualTo(root.get("pricePerDay"), min);
            return cb.lessThanOrEqualTo(root.get("pricePerDay"), max);
        };
    }
}
