package com.pm.portfolioapi.service;

import com.pm.portfolioapi.model.Settings;
import com.pm.portfolioapi.repository.SettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SettingsService {
    @Autowired
    private SettingsRepository settingsRepository;

    /**
     * Get setting by ID
     * @param id the settings ID
     * @return Optional containing the settings if found
     */
    public Optional<Settings> getSettingById(String id) {
        return settingsRepository.findById(id);
    }

    /**
     * Get setting by key
     * @param key the settings key
     * @return Optional containing the settings if found
     */
    public Optional<Settings> getSettingByKey(String key) {
        return settingsRepository.findByKey(key);
    }

    /**
     * Get setting value by ID
     * @param id the settings ID
     * @return the value or null if not found
     */
    public String getValueById(String id) {
        return settingsRepository.findById(id)
                .map(Settings::getValue)
                .orElse(null);
    }

    /**
     * Get all settings
     * @return list of all settings
     */
    public List<Settings> getAllSettings() {
        return settingsRepository.findAll();
    }

    /**
     * Save or update a setting
     * @param setting the settings object to save
     * @return the saved settings
     */
    public Settings saveSetting(Settings setting) {
        return settingsRepository.save(setting);
    }

    /**
     * Delete setting by ID
     * @param id the settings ID
     */
    public void deleteSetting(String id) {
        settingsRepository.deleteById(id);
    }

    /**
     * Check if setting exists by ID
     * @param id the settings ID
     * @return true if setting exists, false otherwise
     */
    public boolean settingExists(String id) {
        return settingsRepository.existsById(id);
    }

    /**
     * Check if setting exists by key
     * @param key the settings key
     * @return true if setting exists, false otherwise
     */
    public boolean settingExistsByKey(String key) {
        return settingsRepository.existsByKey(key);
    }
}
