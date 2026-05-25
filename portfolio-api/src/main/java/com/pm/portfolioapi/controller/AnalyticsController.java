package com.pm.portfolioapi.controller;

import com.pm.portfolioapi.Dto.AnalyticsEventRequest;
import com.pm.portfolioapi.Dto.AnalyticsOverviewResponse;
import com.pm.portfolioapi.Dto.AnalyticsSourceBreakdown;
import com.pm.portfolioapi.Dto.AnalyticsTrendPoint;
import com.pm.portfolioapi.model.AnalyticsEvent;
import com.pm.portfolioapi.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
@Tag(name = "Analytics", description = "Portfolio analytics API")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @PostMapping("/events")
    @Operation(summary = "Record analytics event", description = "Record a single analytics event")
    public ResponseEntity<AnalyticsEvent> recordEvent(@RequestBody AnalyticsEventRequest request) {
        return ResponseEntity.ok(analyticsService.recordEvent(request));
    }

    @GetMapping("/overview")
    @Operation(summary = "Get overview metrics", description = "Get card totals and month-over-month change")
    public AnalyticsOverviewResponse getOverview(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getOverview(from, to);
    }

    @GetMapping("/profile-views-trend")
    @Operation(summary = "Get profile views trend", description = "Get daily profile view counts for a date range")
    public List<AnalyticsTrendPoint> getProfileViewsTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getProfileViewsTrend(from, to);
    }

    @GetMapping("/sources")
    @Operation(summary = "Get top sources", description = "Get profile view source breakdown for a date range")
    public List<AnalyticsSourceBreakdown> getTopSources(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getTopSources(from, to);
    }
}

