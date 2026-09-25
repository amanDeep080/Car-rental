package com.velocira.service;

import com.velocira.entity.Notification;
import com.velocira.entity.User;
import com.velocira.repository.NotificationRepository;
import com.velocira.service.notification.NotificationChannel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final List<NotificationChannel> channels; // Spring injects every NotificationChannel bean

    /** Records an in-app notification and fans out to any additional
     *  channels requested (e.g. Set.of("EMAIL") for a booking confirmation
     *  that should also hit the customer's inbox). IN_APP is always
     *  recorded regardless of what's passed. */
    public void notify(User user, String type, String title, String body, Set<String> extraChannels) {
        Notification n = new Notification();
        n.setUser(user);
        n.setType(type);
        n.setTitle(title);
        n.setBody(body);
        n.setChannels("IN_APP" + (extraChannels.isEmpty() ? "" : "," + String.join(",", extraChannels)));
        notificationRepository.save(n);

        for (NotificationChannel channel : channels) {
            if (extraChannels.contains(channel.channelName())) {
                channel.send(user, title, body);
            }
        }
    }

    public List<Notification> getMyNotifications(UUID userId) {
        return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
    }

    public long unreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
