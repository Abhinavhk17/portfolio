package com.pm.portfolioapi.repository;

import com.pm.portfolioapi.model.Contact;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContactRepository extends MongoRepository<Contact, String> {
    // Find contacts by email
    List<Contact> findByEmail(String email);

    // Find contacts by full name (case-insensitive)
    List<Contact> findByFullNameContainingIgnoreCase(String fullName);
}

