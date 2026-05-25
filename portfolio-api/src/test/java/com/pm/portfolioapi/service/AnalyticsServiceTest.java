package com.pm.portfolioapi.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AnalyticsServiceTest {
    @Test
    void calculatePercentChangeHandlesZeroPrevious() {
        assertEquals(0.0, AnalyticsService.calculatePercentChange(0, 0));
        assertEquals(100.0, AnalyticsService.calculatePercentChange(10, 0));
    }

    @Test
    void calculatePercentChangeCalculatesIncreaseAndDecrease() {
        assertEquals(50.0, AnalyticsService.calculatePercentChange(150, 100));
        assertEquals(-25.0, AnalyticsService.calculatePercentChange(75, 100));
    }
}

