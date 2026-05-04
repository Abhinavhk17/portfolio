package com.pm.portfolioapi.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "education")
public class Education {
    @Id
    private String id;
    private String name;
    private String instituitionName;
    private String fromYear;
    private String toYear;
    private String location;
    private String cgpa;
    private LocalDateTime lastUpdated;
    private boolean isVisible = true;

    public Education() {
        this.lastUpdated = LocalDateTime.now();
    }

    public Education(String id, String name, String instituitionName, String fromYear, String toYear, String location, String cgpa) {
        this.id = id;
        this.name = name;
        this.instituitionName = instituitionName;
        this.fromYear = fromYear;
        this.toYear = toYear;
        this.location = location;
        this.cgpa = cgpa;
        this.lastUpdated = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getInstituitionName() {
        return instituitionName;
    }

    public void setInstituitionName(String instituitionName) {
        this.instituitionName = instituitionName;
    }

    public String getFromYear() {
        return fromYear;
    }

    public void setFromYear(String fromYear) {
        this.fromYear = fromYear;
    }

    public String getToYear() {
        return toYear;
    }

    public void setToYear(String toYear) {
        this.toYear = toYear;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCgpa() {
        return cgpa;
    }

    public void setCgpa(String cgpa) {
        this.cgpa = cgpa;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public boolean getIsVisible() {
        return isVisible;
    }

    public void setIsVisible(boolean isVisible) {
        this.isVisible = isVisible;
    }
}
