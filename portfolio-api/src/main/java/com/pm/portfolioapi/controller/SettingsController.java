package com.pm.portfolioapi.controller;

import com.pm.portfolioapi.model.Settings;
import com.pm.portfolioapi.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
@Tag(name = "Settings", description = "Portfolio settings management API")
public class SettingsController {
    @Autowired
    private SettingsService settingsService;

    /**
     * Get all settings
     */
    @GetMapping
    @Operation(summary = "Get all settings", description = "Retrieve all portfolio settings")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all settings")
    public List<Settings> getAllSettings() {
        return settingsService.getAllSettings();
    }

    /**
     * Get setting by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get setting by ID", description = "Retrieve a specific setting by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Setting found and returned"),
            @ApiResponse(responseCode = "404", description = "Setting not found")
    })
    public ResponseEntity<Settings> getSettingById(
            @Parameter(description = "Setting ID", required = true) @PathVariable String id) {
        Optional<Settings> setting = settingsService.getSettingById(id);
        return setting.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Get setting by key
     */
    @GetMapping("/key/{key}")
    @Operation(summary = "Get setting by key", description = "Retrieve a specific setting by its key")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Setting found and returned"),
            @ApiResponse(responseCode = "404", description = "Setting not found")
    })
    public ResponseEntity<Settings> getSettingByKey(
            @Parameter(description = "Setting key", required = true) @PathVariable String key) {
        Optional<Settings> setting = settingsService.getSettingByKey(key);
        return setting.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Get setting value by ID
     */
    @GetMapping("/{id}/value")
    @Operation(summary = "Get setting value by ID", description = "Retrieve only the value of a setting")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Setting value found and returned"),
            @ApiResponse(responseCode = "404", description = "Setting not found")
    })
    public ResponseEntity<String> getSettingValue(
            @Parameter(description = "Setting ID", required = true) @PathVariable String id) {
        String value = settingsService.getValueById(id);
        if (value != null) {
            return ResponseEntity.ok(value);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Create a new setting
     */
    @PostMapping
    @Operation(summary = "Create new setting", description = "Add a new portfolio setting")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Setting created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid setting data")
    })
    public ResponseEntity<Settings> createSetting(@RequestBody Settings setting) {
        if (setting.getKey() == null || setting.getKey().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (settingsService.settingExistsByKey(setting.getKey())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        Settings created = settingsService.saveSetting(setting);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update an existing setting
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update setting", description = "Update an existing portfolio setting")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Setting updated successfully"),
            @ApiResponse(responseCode = "404", description = "Setting not found"),
            @ApiResponse(responseCode = "400", description = "Invalid setting data")
    })
    public ResponseEntity<Settings> updateSetting(
            @Parameter(description = "Setting ID", required = true) @PathVariable String id,
            @RequestBody Settings setting) {
        if (!settingsService.settingExists(id)) {
            return ResponseEntity.notFound().build();
        }
        if (setting.getKey() == null || setting.getKey().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Optional<Settings> existingByKey = settingsService.getSettingByKey(setting.getKey());
        if (existingByKey.isPresent() && !id.equals(existingByKey.get().getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        setting.setId(id);
        Settings updated = settingsService.saveSetting(setting);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete a setting
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete setting", description = "Remove a setting from the portfolio")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Setting deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Setting not found")
    })
    public ResponseEntity<Void> deleteSetting(
            @Parameter(description = "Setting ID", required = true) @PathVariable String id) {
        if (!settingsService.settingExists(id)) {
            return ResponseEntity.notFound().build();
        }
        settingsService.deleteSetting(id);
        return ResponseEntity.noContent().build();
    }
}
