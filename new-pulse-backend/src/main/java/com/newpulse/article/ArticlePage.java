package com.newpulse.article;

import com.newpulse.category.NewsCategory;
import java.util.List;

public record ArticlePage(
        NewsCategory category,
        List<Article> articles,
        Metadata page
) {

    public record Metadata(
            int totalCount,
            int limit,
            int offset,
            boolean hasNext,
            Integer nextOffset
    ) {
    }
}
