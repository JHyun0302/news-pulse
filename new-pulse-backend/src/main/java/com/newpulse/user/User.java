package com.newpulse.user;

import com.newpulse.category.NewsCategory;
import com.newpulse.common.TimeWindow;
import java.util.List;

public record User(
        int userNo,
        String name,
        String deviceId,
        PushType pushType,
        TimeWindow dndWindow,
        List<NewsCategory> preferences
) {
}
