package com.newpulse.article;

import java.time.OffsetDateTime;

public record RssCollectResult(
        OffsetDateTime startedAt,
        OffsetDateTime finishedAt,
        int feedCount,
        int newArticleCount,
        int skippedDuplicateCount,
        int failedFeedCount
) {
}
