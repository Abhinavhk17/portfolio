package com.pm.portfolioapi.repository;

import com.pm.portfolioapi.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {
    // Custom query methods (if needed) can be added here
}

