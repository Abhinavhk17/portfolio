package com.pm.portfolioapi.Dto;

import com.pm.portfolioapi.model.AnalyticsEventType;

public record AnalyticsEventRequest(
        AnalyticsEventType type,
        String source,
        String projectId
) {
}

