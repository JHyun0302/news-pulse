package com.newpulse.article;

import com.newpulse.category.NewsCategory;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ArticleService {

    private static final Logger log = LoggerFactory.getLogger(ArticleService.class);

    private final RssFeedProperties rssFeedProperties;
    private final RssFeedClient rssFeedClient;
    private final RssItemParser rssItemParser;
    private final ArticleRepository articleRepository;
    private final Clock clock;

    public ArticleService(
            RssFeedProperties rssFeedProperties,
            RssFeedClient rssFeedClient,
            RssItemParser rssItemParser,
            ArticleRepository articleRepository,
            Clock clock
    ) {
        this.rssFeedProperties = rssFeedProperties;
        this.rssFeedClient = rssFeedClient;
        this.rssItemParser = rssItemParser;
        this.articleRepository = articleRepository;
        this.clock = clock;
    }

    public RssCollectResult collectRssFeeds() {
        OffsetDateTime startedAt = OffsetDateTime.now(clock);
        int failedFeeds = 0;
        List<RssItem> collected = new ArrayList<>();

        for (NewsCategory category : NewsCategory.values()) {
            String url = rssFeedProperties.feeds().get(category);
            try {
                String xml = rssFeedClient.fetch(url);
                collected.addAll(rssItemParser.parse(xml, category));
            } catch (RuntimeException e) {
                failedFeeds++;
                log.warn("RSS feed collection failed. category={}, reason={}", category.name(), e.getMessage());
            }
        }

        ArticleSaveResult saveResult = articleRepository.saveAll(collected);
        OffsetDateTime finishedAt = OffsetDateTime.now(clock);
        return new RssCollectResult(
                startedAt,
                finishedAt,
                NewsCategory.values().length,
                saveResult.newArticleCount(),
                saveResult.skippedDuplicateCount(),
                failedFeeds);
    }

    public List<CategorySummary> categorySummaries(String clientId) {
        return articleRepository.categorySummaries(clientId);
    }

    public ArticlePage articlesByCategory(String categoryCode, String clientId, Integer limit, Integer offset) {
        NewsCategory category = NewsCategory.fromCode(categoryCode);
        int normalizedLimit = normalizeLimit(limit, 50, 100);
        int normalizedOffset = normalizeOffset(offset);
        int totalCount = articleRepository.countByCategory(category);
        List<Article> articles = articleRepository.findByCategory(category, clientId, normalizedLimit, normalizedOffset);
        boolean hasNext = normalizedOffset + articles.size() < totalCount;
        Integer nextOffset = hasNext ? normalizedOffset + normalizedLimit : null;
        return new ArticlePage(
                category,
                articles,
                new ArticlePage.Metadata(totalCount, normalizedLimit, normalizedOffset, hasNext, nextOffset));
    }

    public Article articleDetail(String articleId, String clientId) {
        return articleRepository.findById(articleId, clientId)
                .orElseThrow(() -> new NoSuchElementException("article not found: " + articleId));
    }

    public boolean articleExists(String articleId) {
        return articleRepository.exists(articleId);
    }

    private int normalizeLimit(Integer requested, int defaultLimit, int maxLimit) {
        if (requested == null) {
            return defaultLimit;
        }
        if (requested <= 0) {
            throw new IllegalArgumentException("limit must be positive");
        }
        return Math.min(requested, maxLimit);
    }

    private int normalizeOffset(Integer requested) {
        if (requested == null) {
            return 0;
        }
        if (requested < 0) {
            throw new IllegalArgumentException("offset must be zero or positive");
        }
        return requested;
    }
}
