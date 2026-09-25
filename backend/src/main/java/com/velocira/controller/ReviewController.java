package com.velocira.controller;

import com.velocira.dto.review.ReviewResponse;
import com.velocira.dto.review.ReviewSubmitRequest;
import com.velocira.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/api/reviews")
    public ResponseEntity<ReviewResponse> submit(@Valid @RequestBody ReviewSubmitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.submit(request));
    }

    @GetMapping("/api/cars/{carId}/reviews")
    public ResponseEntity<List<ReviewResponse>> forCar(@PathVariable UUID carId) {
        return ResponseEntity.ok(reviewService.getForCar(carId));
    }
}
