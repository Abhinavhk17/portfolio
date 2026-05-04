package com.pm.portfolioapi.repository;

import com.pm.portfolioapi.model.Education;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EducationRepository extends MongoRepository<Education, String> {
    // Find education by name (institution name)
    List<Education> findByNameContainingIgnoreCase(String name);

    // Find education by location
    List<Education> findByLocation(String location);

    // Find education by year range
    List<Education> findByFromYear(String fromYear);
}

