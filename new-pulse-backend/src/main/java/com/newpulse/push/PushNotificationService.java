package com.newpulse.push;

public interface PushNotificationService {

    String sendAPNS(String device_id, String article_id, String title);

    String sendFCM(String device_id, String article_id, String title);
}
