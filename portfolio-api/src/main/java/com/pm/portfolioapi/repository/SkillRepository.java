package com.pm.portfolioapi.repository;

import com.pm.portfolioapi.model.Skill;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SkillRepository extends MongoRepository<Skill, String> {
    // Add custom query methods if needed
}

