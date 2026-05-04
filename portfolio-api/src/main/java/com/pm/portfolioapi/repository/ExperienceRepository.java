package com.pm.portfolioapi.repository;

import com.pm.portfolioapi.model.Experience;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExperienceRepository extends MongoRepository<Experience, String> {
    // Add custom query methods if needed
}

