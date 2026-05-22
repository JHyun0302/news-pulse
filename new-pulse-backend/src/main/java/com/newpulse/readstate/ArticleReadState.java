package com.newpulse.readstate;

import java.time.OffsetDateTime;

public record ArticleReadState(String articleId, String clientId, boolean read, OffsetDateTime readAt) {
}
