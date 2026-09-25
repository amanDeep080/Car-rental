package com.velocira.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class LiveNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcast(String type, String title, String message) {
        messagingTemplate.convertAndSend("/topic/admin-notifications", Map.of(
            "type", type,
            "title", title,
            "message", message,
            "timestamp", java.time.Instant.now().toString()
        ));
    }

    public void notifyUserLogin(String email, String name) {
        broadcast("LOGIN", "User Logged In", name + " (" + email + ") just signed in.");
    }

    public void notifyAccountCreated(String email, String name) {
        broadcast("REGISTER", "New Account", name + " (" + email + ") just registered.");
    }

    public void notifyBookingAttempt(String email, String carModel) {
        broadcast("BOOKING", "Booking Attempt", email + " is trying to book " + carModel);
    }
}
