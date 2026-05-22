package com.newpulse.push;

import java.time.OffsetDateTime;

public record PushDispatchResult(
        OffsetDateTime startedAt,
        OffsetDateTime finishedAt,
        int targetCount,
        int successCount,
        int failCount,
        int skippedByDndCount,
        int skippedDuplicateCount
) {
}
