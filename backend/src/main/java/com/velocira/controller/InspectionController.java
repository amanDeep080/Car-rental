package com.velocira.controller;

import com.velocira.dto.inspection.InspectionResponse;
import com.velocira.dto.inspection.InspectionSubmitRequest;
import com.velocira.service.InspectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings/{reference}/inspections")
@RequiredArgsConstructor
public class InspectionController {

    private final InspectionService inspectionService;

    @PostMapping
    public ResponseEntity<InspectionResponse> submit(
        @PathVariable String reference,
        @Valid @RequestBody InspectionSubmitRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inspectionService.submit(reference, request));
    }

    @GetMapping("/{type}")
    public ResponseEntity<InspectionResponse> get(@PathVariable String reference, @PathVariable String type) {
        return ResponseEntity.ok(inspectionService.get(reference, type.toUpperCase()));
    }
}
