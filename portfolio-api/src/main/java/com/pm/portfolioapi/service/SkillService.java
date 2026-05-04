package com.pm.portfolioapi.service;

import com.pm.portfolioapi.model.Skill;
import com.pm.portfolioapi.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SkillService {
    @Autowired
    private SkillRepository skillRepository;
    @Autowired
    private CloudinaryService cloudinaryService;

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public Skill getSkillById(String id) {
        Optional<Skill> skill = skillRepository.findById(id);
        return skill.orElse(null);
    }

    public Skill createSkill(Skill skill, MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Skill image is required");
        }
        try {
            String logoUrl = cloudinaryService.uploadSkillLogo(image, skill.getName());
            skill.setLogoUrl(logoUrl);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to upload skill logo", e);
        }
        skill.setLastUpdated(LocalDateTime.now());
        return skillRepository.save(skill);
    }

    public Skill updateSkill(String id, Skill skill) {
        if (skillRepository.existsById(id)) {
            skill.setId(id);
            skill.setLastUpdated(LocalDateTime.now());
            return skillRepository.save(skill);
        }
        return null;
    }

    public void deleteSkill(String id) {
        skillRepository.deleteById(id);
    }
}
