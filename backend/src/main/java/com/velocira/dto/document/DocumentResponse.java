package com.velocira.dto.document;

import java.time.Instant;
import java.util.UUID;

public record DocumentResponse(
    UUID id,
    String documentType,
    String status,
    String rejectionReason,
    Instant createdAt,
    String url,
    UUID userId,
    String userName,
    String userEmail,
    String userPhone
) {}
