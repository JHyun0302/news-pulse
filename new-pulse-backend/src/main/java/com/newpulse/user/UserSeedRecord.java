package com.newpulse.user;

import com.newpulse.category.NewsCategory;
import com.newpulse.common.TimeWindow;
import java.util.List;

public record UserSeedRecord(
        int userNo,
        String name,
        String deviceId,
        PushType pushType,
        List<NewsCategory> preferences,
        TimeWindow dndWindow
) {
}
