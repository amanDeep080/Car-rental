package com.velocira.controller;

import com.velocira.dto.analytics.AnalyticsOverview;
import com.velocira.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import com.velocira.dto.analytics.BookingReportRow;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private final AdminAnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverview> overview() {
        return ResponseEntity.ok(analyticsService.getOverview());
    }

    @GetMapping("/data")
    public ResponseEntity<com.velocira.dto.analytics.AnalyticsData> data(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to
    ) {
        return ResponseEntity.ok(analyticsService.getData(from, to));
    }

    @GetMapping("/report")
    public ResponseEntity<List<BookingReportRow>> report(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) UUID carId
    ) {
        return ResponseEntity.ok(analyticsService.getBookingReport(from, to, status, carId));
    }
}
