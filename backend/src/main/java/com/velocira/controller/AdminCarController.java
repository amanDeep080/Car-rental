package com.velocira.controller;

import com.velocira.dto.admin.AdminCarUpsertRequest;
import com.velocira.dto.car.CarDetailDto;
import com.velocira.service.AdminCarService;
import com.velocira.service.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/admin/cars")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCarController {

    private final AdminCarService adminCarService;
    private final CloudinaryService cloudinaryService;

    @GetMapping
    public ResponseEntity<List<CarDetailDto>> listAll() {
        return ResponseEntity.ok(adminCarService.listAll());
    }

    @PostMapping(value = "/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        log.info("Received image upload request: {} ({} bytes)", file.getOriginalFilename(), file.getSize());
        String url = cloudinaryService.uploadImage(file, "cars");
        log.info("Image uploaded successfully: {}", url);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping
    public ResponseEntity<CarDetailDto> create(@Valid @RequestBody AdminCarUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminCarService.createCar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarDetailDto> update(@PathVariable UUID id, @Valid @RequestBody AdminCarUpsertRequest request) {
        return ResponseEntity.ok(adminCarService.updateCar(id, request));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable UUID id) {
        adminCarService.deactivateCar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        adminCarService.softDeleteCar(id);
        return ResponseEntity.noContent().build();
    }
}
