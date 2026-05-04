package com.pm.portfolioapi.controller;

import com.pm.portfolioapi.service.CloudinaryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
@Tag(name = "File Management", description = "Handles file operations")
public class FileController {

    private final CloudinaryService cloudinaryService;

    public FileController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @GetMapping
    public ResponseEntity<List<String>> getFiles() {
        try {
            List<String> files = cloudinaryService.getFiles();
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

}
