package com.pm.portfolioapi.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AnalyticsEventType {
    PROFILE_VIEW("profile_view"),
    PROJECT_VIEW("project_view"),
    CONTACT_SUBMIT("contact_submit"),
    CV_DOWNLOAD("cv_download");

    private final String value;

    AnalyticsEventType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static AnalyticsEventType fromValue(String value) {
        if (value == null) {
            return null;
        }
        for (AnalyticsEventType type : values()) {
            if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown analytics event type: " + value);
    }
}

