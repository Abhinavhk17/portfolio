package com.pm.portfolioapi.controller;

import com.pm.portfolioapi.model.Contact;
import com.pm.portfolioapi.service.ContactService;
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
@RequestMapping("/api/contacts")
@CrossOrigin(origins = "*")
@Tag(name = "Contacts", description = "Contact form submissions management API")
public class ContactController {
    @Autowired
    private ContactService contactService;

    @GetMapping
    @Operation(summary = "Get all contact submissions", description = "Retrieve a list of all contact form submissions")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all contact submissions")
    public List<Contact> getAllContacts() {
        return contactService.getAllContacts();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get contact by ID", description = "Retrieve a specific contact submission by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contact found and returned"),
            @ApiResponse(responseCode = "404", description = "Contact not found")
    })
    public ResponseEntity<Contact> getContactById(
            @Parameter(description = "Contact ID", required = true) @PathVariable String id) {
        Contact contact = contactService.getContactById(id);
        return contact != null ? ResponseEntity.ok(contact) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @Operation(summary = "Submit contact form", description = "Create a new contact form submission")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contact form submitted successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid contact data")
    })
    public Contact createContact(@RequestBody Contact contact) {
        return contactService.createContact(contact);
    }


    @GetMapping("/search/email")
    @Operation(summary = "Find contacts by email", description = "Search for contact submissions by email address")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved contacts")
    public List<Contact> findByEmail(
            @Parameter(description = "Email address to search", required = true) @RequestParam String email) {
        return contactService.findByEmail(email);
    }

    @GetMapping("/search/name")
    @Operation(summary = "Find contacts by name", description = "Search for contact submissions by full name")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved contacts")
    public List<Contact> searchByName(
            @Parameter(description = "Name to search", required = true) @RequestParam String name) {
        return contactService.searchByName(name);
    }
}

