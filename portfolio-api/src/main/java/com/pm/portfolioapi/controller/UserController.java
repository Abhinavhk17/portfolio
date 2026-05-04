package com.pm.portfolioapi.controller;

import com.pm.portfolioapi.model.User;
import com.pm.portfolioapi.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@Tag(name = "Users", description = "User management and authentication API")
public class UserController {
    @Autowired
    private UserService userService;

    // Authentication Endpoints
    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user with email and password")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Validate input
            if (loginRequest.getEmail() == null || loginRequest.getPassword() == null) {
                response.put("success", false);
                response.put("message", "Email and password are required");
                return ResponseEntity.badRequest().body(response);
            }

            // Find user by email
            User user = userService.getUserByEmail(loginRequest.getEmail());
            if (user == null) {
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return ResponseEntity.status(401).body(response);
            }

            // Check if user has admin role
            if (user.getRoles() == null || !user.getRoles().contains("ADMIN")) {
                response.put("success", false);
                response.put("message", "Access denied. Admin privileges required.");
                return ResponseEntity.status(401).body(response);
            }

            // Simple password check (plain text comparison)
            if (!user.getPassword().equals(loginRequest.getPassword())) {
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return ResponseEntity.status(401).body(response);
            }

            // Login successful
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "roles", user.getRoles()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "An error occurred during login");
            return ResponseEntity.status(500).body(response);
        }
    }

    // User Management Endpoints
    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieve a list of all users")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by their ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User found and returned"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<User> getUserById(
            @Parameter(description = "User ID", required = true) @PathVariable String id) {
        User user = userService.getUserById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    // DTO Classes
    public static class LoginRequest {
        private String email;
        private String password;

        public LoginRequest() {}

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
