package com.velocira.dto.document;

import com.velocira.entity.enums.DocumentStatus;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.UUID;

public record DocumentUploadRequest(
    @NotBlank String documentType,
    @NotBlank String storageKey // returned by the storage provider after client-side signed upload
) {}
