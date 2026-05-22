package com.newpulse.user;

public enum PushType {
    APNS,
    FCM;

    public static PushType normalize(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("push_type is required");
        }
        String normalized = raw.trim();
        if ("APNs".equalsIgnoreCase(normalized) || "APNS".equalsIgnoreCase(normalized)) {
            return APNS;
        }
        if ("FCM".equalsIgnoreCase(normalized)) {
            return FCM;
        }
        throw new IllegalArgumentException("unsupported push_type: " + raw);
    }
}
