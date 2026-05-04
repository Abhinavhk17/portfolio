package com.pm.portfolioapi.controller;

import com.pm.portfolioapi.model.Skill;
import com.pm.portfolioapi.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = "*")
@Tag(name = "Skills", description = "Technical skills management API")
public class SkillController {
    @Autowired
    private SkillService skillService;

    @GetMapping
    @Operation(summary = "Get all skills", description = "Retrieve a list of all technical skills")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all skills")
    public List<Skill> getAllSkills() {
        return skillService.getAllSkills();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get skill by ID", description = "Retrieve a specific skill by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Skill found and returned"),
            @ApiResponse(responseCode = "404", description = "Skill not found")
    })
    public ResponseEntity<Skill> getSkillById(
            @Parameter(description = "Skill ID", required = true) @PathVariable String id) {
        Skill skill = skillService.getSkillById(id);
        return skill != null ? ResponseEntity.ok(skill) : ResponseEntity.notFound().build();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create new skill", description = "Add a new technical skill")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Skill created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid skill data")
    })
    public ResponseEntity<Skill> createSkill(
            @RequestParam("name") String name,
            @RequestParam("image") MultipartFile image) {
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Skill skill = new Skill();
        skill.setName(name);
        Skill created = skillService.createSkill(skill, image);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update skill", description = "Update an existing skill")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Skill updated successfully"),
            @ApiResponse(responseCode = "404", description = "Skill not found"),
            @ApiResponse(responseCode = "400", description = "Invalid skill data")
    })
    public Skill updateSkill(
            @Parameter(description = "Skill ID", required = true) @PathVariable String id,
            @RequestBody Skill skill) {
        return skillService.updateSkill(id, skill);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete skill", description = "Remove a skill from the portfolio")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Skill deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Skill not found")
    })
    public ResponseEntity<Void> deleteSkill(
            @Parameter(description = "Skill ID", required = true) @PathVariable String id) {
        skillService.deleteSkill(id);
        return ResponseEntity.noContent().build();
    }
}
