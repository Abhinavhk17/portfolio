package com.pm.portfolioapi.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "contacts")
public class Contact {
    @Id
    private String id;
    private String fullName;
    private String email;
    private String howCanIHelp;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;

    public Contact() {
        this.createdAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }

    public Contact(String id, String fullName, String email, String howCanIHelp, LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.howCanIHelp = howCanIHelp;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getHowCanIHelp() {
        return howCanIHelp;
    }

    public void setHowCanIHelp(String howCanIHelp) {
        this.howCanIHelp = howCanIHelp;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}

