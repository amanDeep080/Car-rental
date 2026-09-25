package com.velocira.service;

import com.velocira.dto.user.UserProfileResponse;
import com.velocira.dto.user.UserProfileUpdateRequest;
import com.velocira.entity.Role;
import com.velocira.entity.User;
import com.velocira.repository.UserRepository;
import com.velocira.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserProfileResponse getMyProfile() {
        return toResponse(currentUser());
    }

    @Transactional
    public UserProfileResponse updateMyProfile(UserProfileUpdateRequest req) {
        User user = currentUser();
        user.setFullName(req.fullName());
        user.setPhone(req.phone());
        user.setDateOfBirth(req.dateOfBirth());
        return toResponse(userRepository.save(user));
    }

    private UserProfileResponse toResponse(User user) {
        List<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        return new UserProfileResponse(
            user.getId(), user.getFullName(), user.getEmail(), user.getPhone(),
            user.getDateOfBirth(), user.isEmailVerified(), user.isPhoneVerified(), roles
        );
    }

    private User currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in to continue.");
        }
        return userRepository.findById(principal.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account no longer exists."));
    }
}
