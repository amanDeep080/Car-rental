package com.velocira.service.notification;

import com.velocira.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailNotificationChannel implements NotificationChannel {

    private final JavaMailSender mailSender;

    @Override
    public String channelName() {
        return "EMAIL";
    }

    @Override
    public void send(User user, String title, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject(title);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            // Never let a notification failure break the calling business
            // operation (e.g. booking confirmation) — log and move on.
            // NOTE: this depends on spring.mail.* / EMAIL_API_KEY being
            // configured with real SMTP credentials; unconfigured in this
            // environment, so sends will fail here until that's set.
            log.warn("Failed to send email notification to {}: {}", user.getEmail(), ex.getMessage());
        }
    }
}
