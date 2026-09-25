package com.velocira.service;

import com.velocira.dto.admin.AdminCustomerSummary;
import com.velocira.dto.admin.AdminCustomerUpsertRequest;
import com.velocira.dto.document.DocumentResponse;
import com.velocira.entity.Role;
import com.velocira.entity.User;
import com.velocira.exception.ResourceNotFoundException;
import com.velocira.repository.BookingRepository;
import com.velocira.repository.DocumentRepository;
import com.velocira.repository.RoleRepository;
import com.velocira.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminCustomerService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BookingRepository bookingRepository;
    private final DocumentRepository documentRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;

    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminCustomerSummary> listAll() {
        return userRepository.findAll().stream()
            .filter(u -> u.getRoles().stream().anyMatch(r -> "CUSTOMER".equals(r.getName())))
            .map(this::toSummary)
            .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public AdminCustomerSummary getById(UUID userId) {
        User u = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found."));
        return toSummary(u);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public AdminCustomerSummary createCustomer(AdminCustomerUpsertRequest req) {
        if (userRepository.existsByEmailIgnoreCase(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use.");
        }

        User user = new User();
        user.setFullName(req.fullName());
        user.setEmail(req.email().toLowerCase());
        user.setPhone(req.phone());
        user.setDateOfBirth(req.dateOfBirth());
        user.setEmailVerified(req.emailVerified());
        user.setActive(req.active());

        if (req.password() == null || req.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required for new accounts.");
        }
        user.setPasswordHash(passwordEncoder.encode(req.password()));

        Role customerRole = roleRepository.findByName("CUSTOMER")
            .orElseGet(() -> roleRepository.save(new Role("CUSTOMER")));
        Set<Role> roles = new HashSet<>();
        roles.add(customerRole);
        user.setRoles(roles);

        User saved = userRepository.save(user);
        auditLogService.record("ADMIN_CREATED_CUSTOMER", "CUSTOMER", saved.getId().toString(), saved.getFullName());
        return toSummary(saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public AdminCustomerSummary updateCustomer(UUID userId, AdminCustomerUpsertRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found."));

        // If email changed, check uniqueness
        if (!user.getEmail().equalsIgnoreCase(req.email()) && userRepository.existsByEmailIgnoreCase(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "New email already in use.");
        }

        user.setFullName(req.fullName());
        user.setEmail(req.email().toLowerCase());
        user.setPhone(req.phone());
        user.setDateOfBirth(req.dateOfBirth());
        user.setEmailVerified(req.emailVerified());
        user.setActive(req.active());

        if (req.password() != null && !req.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(req.password()));
        }

        User saved = userRepository.save(user);
        auditLogService.record("ADMIN_UPDATED_CUSTOMER", "CUSTOMER", saved.getId().toString(), saved.getFullName());
        return toSummary(saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void setActive(UUID userId, boolean active) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found."));
        user.setActive(active);
        userRepository.save(user);
        auditLogService.record(active ? "ADMIN_UNBLOCKED_CUSTOMER" : "ADMIN_BLOCKED_CUSTOMER", "CUSTOMER", userId.toString(), user.getFullName());
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<DocumentResponse> getCustomerDocuments(UUID userId) {
        return documentRepository.findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId).stream()
            .map(d -> new DocumentResponse(
                d.getId(), d.getDocumentType(), d.getStatus().name(), d.getRejectionReason(), d.getCreatedAt(), d.getStorageKey(),
                d.getUser().getId(), d.getUser().getFullName(), d.getUser().getEmail(), d.getUser().getPhone()
            ))
            .toList();
    }

    private AdminCustomerSummary toSummary(User u) {
        return new AdminCustomerSummary(
            u.getId(), u.getFullName(), u.getEmail(), u.getPhone(),
            u.isActive(), u.isEmailVerified(), u.getCreatedAt(), u.getLastSeenAt(),
            bookingRepository.findByUserIdOrderByPickupAtDesc(u.getId()).size()
        );
    }
}
