package com.newpulse.readstate;

import com.newpulse.article.ArticleService;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

@Service
public class ArticleReadStateService {

    private final ArticleService articleService;
    private final ArticleReadStateRepository articleReadStateRepository;
    private final Clock clock;

    public ArticleReadStateService(
            ArticleService articleService,
            ArticleReadStateRepository articleReadStateRepository,
            Clock clock
    ) {
        this.articleService = articleService;
        this.articleReadStateRepository = articleReadStateRepository;
        this.clock = clock;
    }

    public ArticleReadState markRead(String articleId, String clientId) {
        String normalizedClientId = normalizeClientId(clientId);
        if (!articleService.articleExists(articleId)) {
            throw new NoSuchElementException("article not found: " + articleId);
        }
        OffsetDateTime readAt = OffsetDateTime.now(clock);
        articleReadStateRepository.markRead(normalizedClientId, articleId, readAt);
        return new ArticleReadState(articleId, normalizedClientId, true, readAt);
    }

    private String normalizeClientId(String clientId) {
        if (clientId == null || clientId.isBlank()) {
            throw new IllegalArgumentException("clientId is required");
        }
        return clientId.trim();
    }
}
