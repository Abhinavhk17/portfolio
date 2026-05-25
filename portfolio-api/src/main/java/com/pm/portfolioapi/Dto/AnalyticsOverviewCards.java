package com.pm.portfolioapi.Dto;

public record AnalyticsOverviewCards(
        AnalyticsMetric profileViews,
        AnalyticsMetric projectViews,
        AnalyticsMetric contactRequests,
        AnalyticsMetric cvDownloads
) {
}

