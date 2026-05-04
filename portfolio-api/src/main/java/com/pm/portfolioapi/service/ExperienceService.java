package com.pm.portfolioapi.service;

import com.pm.portfolioapi.model.Experience;
import com.pm.portfolioapi.repository.ExperienceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ExperienceService {
    @Autowired
    private ExperienceRepository experienceRepository;

    public List<Experience> getAllExperiences() {
        return experienceRepository.findAll();
    }

    public Experience getExperienceById(String id) {
        Optional<Experience> experience = experienceRepository.findById(id);
        return experience.orElse(null);
    }

    public Experience createExperience(Experience experience) {
        experience.setLastUpdated(LocalDateTime.now());
        return experienceRepository.save(experience);
    }

    public Experience updateExperience(String id, Experience experience) {
        if (experienceRepository.existsById(id)) {
            experience.setId(id);
            experience.setLastUpdated(LocalDateTime.now());
            return experienceRepository.save(experience);
        }
        return null;
    }

    public void deleteExperience(String id) {
        experienceRepository.deleteById(id);
    }
}
