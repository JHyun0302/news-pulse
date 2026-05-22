package com.newpulse.article;

import com.newpulse.category.NewsCategory;

public record CategorySummary(NewsCategory category, int articleCount, int unreadCount) {
}
