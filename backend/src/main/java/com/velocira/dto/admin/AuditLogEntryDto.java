package com.velocira.dto.admin;

import java.time.Instant;
import java.util.UUID;

public record AuditLogEntryDto(
    UUID id, String action, String entityType, String entityId, String performedBy, String metadata, Instant createdAt
) {}
