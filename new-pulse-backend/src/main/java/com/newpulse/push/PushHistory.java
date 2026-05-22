package com.newpulse.push;

import com.newpulse.category.NewsCategory;
import com.newpulse.user.PushType;
import java.time.OffsetDateTime;

public record PushHistory(
        long id,
        int userNo,
        String deviceId,
        PushType pushType,
        String articleId,
        String title,
        NewsCategory category,
        OffsetDateTime sentAt,
        String status
) {
}
