package com.velocira.service.notification;

import com.velocira.entity.User;

public interface NotificationChannel {
    String channelName();
    void send(User user, String title, String body);
}
