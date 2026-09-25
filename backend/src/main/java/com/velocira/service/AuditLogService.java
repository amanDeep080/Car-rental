package com.velocira.service;

import com.velocira.entity.AuditLog;
import com.velocira.repository.AuditLogRepository;
import com.velocira.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void record(String action, String entityType, String entityId, String metadata) {
        record(action, entityType, entityId, null, metadata);
    }

    public void record(String action, String entityType, String entityId, String actorLabel, String metadata) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setPerformedBy(actorLabel != null ? actorLabel : currentActorLabel());
        log.setMetadata(metadata);
        auditLogRepository.save(log);
    }

    public Page<AuditLog> recent(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    private String currentActorLabel() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getUser().getEmail();
        }
        return "SYSTEM";
    }
}
