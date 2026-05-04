package com.pm.portfolioapi.service;

import com.pm.portfolioapi.model.Education;
import com.pm.portfolioapi.repository.EducationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EducationService {
    @Autowired
    private EducationRepository educationRepository;

    public List<Education> getAllEducation() {
        return educationRepository.findAll();
    }

    public Education getEducationById(String id) {
        Optional<Education> education = educationRepository.findById(id);
        return education.orElse(null);
    }

    public Education createEducation(Education education) {
        education.setLastUpdated(LocalDateTime.now());
        return educationRepository.save(education);
    }

    public Education updateEducation(String id, Education education) {
        if (educationRepository.existsById(id)) {
            education.setId(id);
            education.setLastUpdated(LocalDateTime.now());
            return educationRepository.save(education);
        }
        return null;
    }

    public void deleteEducation(String id) {
        educationRepository.deleteById(id);
    }

    public List<Education> searchByName(String name) {
        return educationRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Education> findByLocation(String location) {
        return educationRepository.findByLocation(location);
    }

    public List<Education> findByFromYear(String fromYear) {
        return educationRepository.findByFromYear(fromYear);
    }
}

