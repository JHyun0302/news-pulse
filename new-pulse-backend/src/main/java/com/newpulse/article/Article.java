package com.newpulse.article;

import com.newpulse.category.NewsCategory;
import java.time.OffsetDateTime;
import java.util.List;

public record Article(
        String articleId,
        String title,
        String link,
        String creator,
        OffsetDateTime publishedAt,
        List<NewsCategory> categories,
        boolean read
) {
}
