package com.pm.portfolioapi.Dto;

import java.time.LocalDate;

public record AnalyticsOverviewResponse(
        LocalDate from,
        LocalDate to,
        AnalyticsOverviewCards cards
) {
}

