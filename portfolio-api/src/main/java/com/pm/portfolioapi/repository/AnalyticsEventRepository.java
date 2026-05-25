package com.pm.portfolioapi.repository;

import com.pm.portfolioapi.model.AnalyticsEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnalyticsEventRepository extends MongoRepository<AnalyticsEvent, String> {
}

