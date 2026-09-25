package com.velocira.controller;

import com.velocira.dto.ai.AiRecommendRequest;
import com.velocira.dto.ai.AiRecommendResponse;
import com.velocira.service.AiRecommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiRecommendationController {

    private final AiRecommendationService aiRecommendationService;

    @PostMapping("/recommend")
    public ResponseEntity<AiRecommendResponse> recommend(@Valid @RequestBody AiRecommendRequest request) {
        return ResponseEntity.ok(aiRecommendationService.recommend(request));
    }
}
