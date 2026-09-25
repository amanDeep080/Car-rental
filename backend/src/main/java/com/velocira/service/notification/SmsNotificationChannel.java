package com.velocira.service.notification;

import com.velocira.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Structural placeholder for an SMS provider (Twilio, MSG91, etc.). No SMS
 * gateway credentials or HTTP integration exist in this environment to
 * build and verify a real one against — rather than fabricate a call to an
 * unverified API shape, this logs what would be sent and exposes the
 * SMS_API_KEY configuration point spec §72 asks for, ready for a real
 * provider's SDK/HTTP client to be dropped in here.
 */
@Slf4j
@Component
public class SmsNotificationChannel implements NotificationChannel {

    @Value("${app.notification.sms-api-key:}")
    private String smsApiKey;

    @Override
    public String channelName() {
        return "SMS";
    }

    @Override
    public void send(User user, String title, String body) {
        if (smsApiKey == null || smsApiKey.isBlank()) {
            log.info("[SMS not configured] Would send to {}: {} — {}", user.getPhone(), title, body);
            return;
        }
        // Wire a real provider call here once SMS_API_KEY is set.
        log.info("[SMS stub] To {}: {} — {}", user.getPhone(), title, body);
    }
}
