package com.pm.portfolioapi.repository;

import com.pm.portfolioapi.model.Settings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SettingsRepository extends MongoRepository<Settings, String> {
    /**
     * Find settings by key
     * @param key the settings key
     * @return Optional containing the settings if found
     */
    Optional<Settings> findByKey(String key);

    boolean existsByKey(String key);
}
