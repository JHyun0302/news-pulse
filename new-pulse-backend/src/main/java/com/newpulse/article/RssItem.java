package com.newpulse.article;

import com.newpulse.category.NewsCategory;
import java.time.OffsetDateTime;

public record RssItem(
        String articleId,
        String title,
        String link,
        String creator,
        OffsetDateTime publishedAt,
        NewsCategory category
) {
}
