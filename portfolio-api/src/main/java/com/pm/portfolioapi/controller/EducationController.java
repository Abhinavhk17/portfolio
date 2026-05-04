package com.pm.portfolioapi.controller;

import com.pm.portfolioapi.model.Education;
import com.pm.portfolioapi.service.EducationService;
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
@RequestMapping("/api/education")
@CrossOrigin(origins = "*")
@Tag(name = "Education", description = "Education history management API")
public class EducationController {
    @Autowired
    private EducationService educationService;

    @GetMapping
    @Operation(summary = "Get all education records", description = "Retrieve a list of all education entries")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all education records")
    public List<Education> getAllEducation() {
        return educationService.getAllEducation();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get education by ID", description = "Retrieve a specific education entry by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Education found and returned"),
            @ApiResponse(responseCode = "404", description = "Education not found")
    })
    public ResponseEntity<Education> getEducationById(
            @Parameter(description = "Education ID", required = true) @PathVariable String id) {
        Education education = educationService.getEducationById(id);
        return education != null ? ResponseEntity.ok(education) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @Operation(summary = "Create education record", description = "Add a new education entry")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Education created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid education data")
    })
    public Education createEducation(@RequestBody Education education) {
        return educationService.createEducation(education);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update education record", description = "Update an existing education entry")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Education updated successfully"),
            @ApiResponse(responseCode = "404", description = "Education not found"),
            @ApiResponse(responseCode = "400", description = "Invalid education data")
    })
    public ResponseEntity<Education> updateEducation(
            @Parameter(description = "Education ID", required = true) @PathVariable String id,
            @RequestBody Education education) {
        Education updatedEducation = educationService.updateEducation(id, education);
        return updatedEducation != null ? ResponseEntity.ok(updatedEducation) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete education record", description = "Remove an education entry")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Education deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Education not found")
    })
    public ResponseEntity<Void> deleteEducation(
            @Parameter(description = "Education ID", required = true) @PathVariable String id) {
        educationService.deleteEducation(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search/name")
    @Operation(summary = "Find education by institution name", description = "Search for education entries by institution name")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved education records")
    public List<Education> searchByName(
            @Parameter(description = "Institution name to search", required = true) @RequestParam String name) {
        return educationService.searchByName(name);
    }

    @GetMapping("/search/location")
    @Operation(summary = "Find education by location", description = "Search for education entries by location")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved education records")
    public List<Education> findByLocation(
            @Parameter(description = "Location to search", required = true) @RequestParam String location) {
        return educationService.findByLocation(location);
    }

    @GetMapping("/search/year")
    @Operation(summary = "Find education by starting year", description = "Search for education entries by from year")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved education records")
    public List<Education> findByFromYear(
            @Parameter(description = "Starting year to search", required = true) @RequestParam String fromYear) {
        return educationService.findByFromYear(fromYear);
    }
}

