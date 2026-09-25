package com.velocira.service;

import com.velocira.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserPresenceService {

    private final UserRepository userRepository;

    @Transactional
    public void updateLastSeen(UUID userId) {
        userRepository.updateLastSeen(userId, Instant.now());
    }
}
