package com.pm.portfolioapi.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "analytics_events")
public class AnalyticsEvent {
    @Id
    private String id;
    private AnalyticsEventType type;
    private String source;
    private String projectId;
    private LocalDateTime createdAt;

    public AnalyticsEvent() {
    }

    public AnalyticsEvent(AnalyticsEventType type, String source, String projectId, LocalDateTime createdAt) {
        this.type = type;
        this.source = source;
        this.projectId = projectId;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public AnalyticsEventType getType() {
        return type;
    }

    public void setType(AnalyticsEventType type) {
        this.type = type;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

