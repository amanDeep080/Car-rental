package com.velocira.service;

import com.velocira.dto.admin.AdminLocationResponse;
import com.velocira.dto.admin.AdminLocationUpsertRequest;
import com.velocira.entity.Location;
import com.velocira.exception.ResourceNotFoundException;
import com.velocira.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminLocationService {

    private final LocationRepository locationRepository;
    private final AuditLogService auditLogService;

    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminLocationResponse> listAll() {
        log.info("Fetching all locations for admin");
        try {
            return locationRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
        } catch (Exception e) {
            log.error("Failed to list locations: {}", e.getMessage());
            throw e;
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public AdminLocationResponse create(AdminLocationUpsertRequest req) {
        Location loc = new Location();
        apply(loc, req);
        Location saved = locationRepository.save(loc);
        auditLogService.record("ADMIN_CREATED_LOCATION", "LOCATION", saved.getId().toString(), saved.getBranchName());
        return toResponse(saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public AdminLocationResponse update(UUID id, AdminLocationUpsertRequest req) {
        Location loc = locationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Location not found."));
        apply(loc, req);
        Location saved = locationRepository.save(loc);
        auditLogService.record("ADMIN_UPDATED_LOCATION", "LOCATION", saved.getId().toString(), saved.getBranchName());
        return toResponse(saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void delete(UUID id) {
        Location loc = locationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Location not found."));
        loc.setActive(false);
        locationRepository.save(loc);
        auditLogService.record("ADMIN_DEACTIVATED_LOCATION", "LOCATION", id.toString(), loc.getBranchName());
    }

    private AdminLocationResponse toResponse(Location l) {
        return new AdminLocationResponse(
            l.getId(), l.getCity(), l.getBranchName(), l.getAddress(),
            l.getContactNumber(), l.getOpeningHours(), l.getLatitude(), l.getLongitude(),
            l.isActive()
        );
    }

    private void apply(Location loc, AdminLocationUpsertRequest req) {
        loc.setCity(req.city());
        loc.setBranchName(req.branchName());
        loc.setAddress(req.address());
        loc.setContactNumber(req.contactNumber());
        loc.setOpeningHours(req.openingHours());
        loc.setLatitude(req.latitude());
        loc.setLongitude(req.longitude());
        loc.setActive(req.active() != null ? req.active() : true);
    }
}
