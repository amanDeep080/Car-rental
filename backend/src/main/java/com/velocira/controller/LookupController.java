package com.velocira.controller;

import com.velocira.dto.lookup.AddonDto;
import com.velocira.dto.lookup.LocationDto;
import com.velocira.repository.AddonRepository;
import com.velocira.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class LookupController {

    private final AddonRepository addonRepository;
    private final LocationRepository locationRepository;

    @GetMapping("/api/addons")
    public ResponseEntity<List<AddonDto>> addons() {
        List<AddonDto> dtos = addonRepository.findAllByActiveTrue().stream()
            .map(a -> new AddonDto(a.getId(), a.getName(), a.getDescription(), a.getPrice(), a.getPricingType()))
            .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/api/locations")
    public ResponseEntity<List<LocationDto>> locations() {
        List<LocationDto> dtos = locationRepository.findAllByActiveTrue().stream()
            .map(l -> new LocationDto(
                l.getId(), l.getCity(), l.getBranchName(), l.getAddress(),
                l.getLatitude(), l.getLongitude(), l.getContactNumber(), l.getOpeningHours()
            ))
            .toList();
        return ResponseEntity.ok()
            .header("Cache-Control", "no-store, max-age=0")
            .body(dtos);
    }
}
