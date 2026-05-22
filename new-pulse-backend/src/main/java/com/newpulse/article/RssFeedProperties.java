package com.newpulse.article;

import com.newpulse.category.NewsCategory;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "news-pulse.rss")
public record RssFeedProperties(long fixedDelayMs, Map<NewsCategory, String> feeds) {
}
