package com.velocira.repository;

import com.velocira.entity.DamageReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DamageReportRepository extends JpaRepository<DamageReport, UUID> {
    List<DamageReport> findAllByBookingId(UUID bookingId);
}
