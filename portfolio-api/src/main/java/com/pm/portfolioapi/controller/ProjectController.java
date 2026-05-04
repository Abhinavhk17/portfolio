package com.pm.portfolioapi.controller;

import com.pm.portfolioapi.model.Project;
import com.pm.portfolioapi.service.ProjectService;
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
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
@Tag(name = "Projects", description = "Portfolio projects management API")
public class ProjectController {
    @Autowired
    private ProjectService projectService;

    @GetMapping
    @Operation(summary = "Get all projects", description = "Retrieve a list of all portfolio projects")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all projects")
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID", description = "Retrieve a specific project by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Project found and returned"),
        @ApiResponse(responseCode = "404", description = "Project not found")
    })
    public ResponseEntity<Project> getProjectById(
            @Parameter(description = "Project ID", required = true) @PathVariable String id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create new project", description = "Add a new project to the portfolio")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Project created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid project data")
    })
    public Project createProject(@RequestBody Project project) {
        return projectService.createProject(project);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update project", description = "Update an existing project")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Project updated successfully"),
        @ApiResponse(responseCode = "404", description = "Project not found"),
        @ApiResponse(responseCode = "400", description = "Invalid project data")
    })
    public Project updateProject(
            @Parameter(description = "Project ID", required = true) @PathVariable String id,
            @RequestBody Project project) {
        return projectService.updateProject(id, project);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete project", description = "Remove a project from the portfolio")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Project deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Project not found")
    })
    public ResponseEntity<Void> deleteProject(
            @Parameter(description = "Project ID", required = true) @PathVariable String id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
