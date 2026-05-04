package com.pm.portfolioapi.service;

import com.pm.portfolioapi.model.Contact;
import com.pm.portfolioapi.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ContactService {

    private static final Logger logger = LoggerFactory.getLogger(ContactService.class);

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private EmailService emailService;

    public List<Contact> getAllContacts() {
        return contactRepository.findAll();
    }

    public Contact getContactById(String id) {
        Optional<Contact> contact = contactRepository.findById(id);
        return contact.orElse(null);
    }

    public Contact createContact(Contact contact) {
        // Set created timestamp if not already set
        if (contact.getCreatedAt() == null) {
            contact.setCreatedAt(LocalDateTime.now());
        }
        contact.setLastUpdated(LocalDateTime.now());

        // Save contact to database
        Contact savedContact = contactRepository.save(contact);

        // Send emails asynchronously (in a try-catch to not fail if email fails)
        try {
            emailService.sendContactFormEmails(
                contact.getFullName(),
                contact.getEmail(),
                contact.getHowCanIHelp()
            );
            logger.info("Emails sent successfully for contact: {}", contact.getEmail());
        } catch (Exception e) {
            logger.error("Failed to send emails for contact: {}. Error: {}", contact.getEmail(), e.getMessage());
            // Don't fail the contact creation if email fails
        }

        return savedContact;
    }


    public List<Contact> findByEmail(String email) {
        return contactRepository.findByEmail(email);
    }

    public List<Contact> searchByName(String name) {
        return contactRepository.findByFullNameContainingIgnoreCase(name);
    }
}

