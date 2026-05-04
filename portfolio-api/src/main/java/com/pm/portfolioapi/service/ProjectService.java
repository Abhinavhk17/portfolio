package com.pm.portfolioapi.service;

import com.pm.portfolioapi.model.Project;
import com.pm.portfolioapi.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Optional<Project> getProjectById(String id) {
        return projectRepository.findById(id);
    }

    public Project createProject(Project project) {
        project.setLastUpdated(LocalDateTime.now());
        return projectRepository.save(project);
    }

    public Project updateProject(String id, Project project) {
        project.setId(id);
        project.setLastUpdated(LocalDateTime.now());
        return projectRepository.save(project);
    }

    public void deleteProject(String id) {
        projectRepository.deleteById(id);
    }
}

