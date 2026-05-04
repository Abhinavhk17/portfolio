package com.pm.portfolioapi.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.name}")
    private String adminName;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Send emails for contact form submission
     * @param userName Name of the person who submitted the form
     * @param userEmail Email of the person who submitted the form
     * @param message The message content
     */
    public void sendContactFormEmails(String userName, String userEmail, String message) {
        try {
            // Send notification to admin
            sendAdminNotification(userName, userEmail, message);
            logger.info("Admin notification email sent successfully for contact from: {}", userEmail);

            // Send confirmation to user
            sendUserConfirmation(userName, userEmail);
            logger.info("User confirmation email sent successfully to: {}", userEmail);

        } catch (MessagingException e) {
            logger.error("Failed to send email for contact from: {}. Error: {}", userEmail, e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    /**
     * Send notification email to admin about new contact form submission
     */
    private void sendAdminNotification(String userName, String userEmail, String message) throws MessagingException {
        Context context = new Context();
        context.setVariable("userName", userName);
        context.setVariable("userEmail", userEmail);
        context.setVariable("message", message);
        context.setVariable("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a")));

        String htmlContent = templateEngine.process("email/admin-notification", context);

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(adminEmail);
        helper.setSubject("🔔 New Contact Form Submission from " + userName);
        helper.setText(htmlContent, true);

        mailSender.send(mimeMessage);
    }

    /**
     * Send confirmation email to user who submitted the contact form
     */
    private void sendUserConfirmation(String userName, String userEmail) throws MessagingException {
        Context context = new Context();
        context.setVariable("userName", userName);
        context.setVariable("adminName", adminName);

        String htmlContent = templateEngine.process("email/user-confirmation", context);

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(userEmail);
        helper.setSubject("✅ Thank you for contacting me!");
        helper.setText(htmlContent, true);

        mailSender.send(mimeMessage);
    }
}

