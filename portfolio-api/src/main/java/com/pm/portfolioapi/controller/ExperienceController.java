package com.pm.portfolioapi.controller;

import com.pm.portfolioapi.model.Experience;
import com.pm.portfolioapi.service.ExperienceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/experiences")
@CrossOrigin(origins = "*")
@Tag(name = "Experiences", description = "Work experience management API")
public class ExperienceController {
    @Autowired
    private ExperienceService experienceService;

    @GetMapping
    @Operation(summary = "Get all experiences", description = "Retrieve a list of all work experiences")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all experiences")
    public List<Experience> getAllExperiences() {
        return experienceService.getAllExperiences();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get experience by ID", description = "Retrieve a specific work experience by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Experience found and returned"),
        @ApiResponse(responseCode = "404", description = "Experience not found")
    })
    public ResponseEntity<Experience> getExperienceById(
            @Parameter(description = "Experience ID", required = true) @PathVariable String id) {
        Experience experience = experienceService.getExperienceById(id);
        return experience != null ? ResponseEntity.ok(experience) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @Operation(summary = "Create new experience", description = "Add a new work experience")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Experience created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid experience data")
    })
    public Experience createExperience(@RequestBody Experience experience) {
        return experienceService.createExperience(experience);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update experience", description = "Update an existing work experience")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Experience updated successfully"),
        @ApiResponse(responseCode = "404", description = "Experience not found"),
        @ApiResponse(responseCode = "400", description = "Invalid experience data")
    })
    public Experience updateExperience(
            @Parameter(description = "Experience ID", required = true) @PathVariable String id,
            @RequestBody Experience experience) {
        return experienceService.updateExperience(id, experience);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete experience", description = "Remove a work experience from the portfolio")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Experience deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Experience not found")
    })
    public ResponseEntity<Void> deleteExperience(
            @Parameter(description = "Experience ID", required = true) @PathVariable String id) {
        experienceService.deleteExperience(id);
        return ResponseEntity.noContent().build();
    }
}
