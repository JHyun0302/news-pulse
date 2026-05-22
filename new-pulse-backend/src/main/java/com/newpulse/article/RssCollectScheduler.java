package com.newpulse.article;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "news-pulse.rss.scheduler", name = "enabled", havingValue = "true", matchIfMissing = true)
public class RssCollectScheduler {

    private static final Logger log = LoggerFactory.getLogger(RssCollectScheduler.class);

    private final ArticleService articleService;

    public RssCollectScheduler(ArticleService articleService) {
        this.articleService = articleService;
    }

    @Scheduled(fixedDelayString = "${news-pulse.rss.fixed-delay-ms:600000}")
    public void collect() {
        RssCollectResult result = articleService.collectRssFeeds();
        log.info(
                "RSS collection finished. feeds={}, newArticles={}, duplicates={}, failedFeeds={}",
                result.feedCount(),
                result.newArticleCount(),
                result.skippedDuplicateCount(),
                result.failedFeedCount());
    }
}
