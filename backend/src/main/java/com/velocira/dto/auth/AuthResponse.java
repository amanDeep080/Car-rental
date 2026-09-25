package com.velocira.dto.auth;

import java.util.List;
import java.util.UUID;

public record AuthResponse(
    UUID userId,
    String fullName,
    String email,
    List<String> roles,
    String accessToken,
    String refreshToken
) {}
