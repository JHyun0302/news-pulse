package com.newpulse.article;

import com.newpulse.category.NewsCategory;
import com.newpulse.readstate.ArticleReadState;
import com.newpulse.readstate.ArticleReadStateService;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;
    private final ArticleReadStateService articleReadStateService;

    public ArticleController(ArticleService articleService, ArticleReadStateService articleReadStateService) {
        this.articleService = articleService;
        this.articleReadStateService = articleReadStateService;
    }

    @GetMapping
    ArticleListResponse articles(
            @RequestParam String category,
            @RequestParam(required = false) String clientId,
            @RequestParam(required = false) Integer limit
    ) {
        NewsCategory newsCategory = NewsCategory.fromCode(category);
        List<ArticleResponse> items = articleService.articlesByCategory(category, clientId, limit).stream()
                .map(ArticleResponse::from)
                .toList();
        return new ArticleListResponse(CategoryResponse.from(newsCategory), items);
    }

    @GetMapping("/{articleId}")
    ArticleResponse article(@PathVariable String articleId, @RequestParam(required = false) String clientId) {
        return ArticleResponse.from(articleService.articleDetail(articleId, clientId));
    }

    @PostMapping("/{articleId}/read")
    ReadResponse markRead(@PathVariable String articleId, @RequestBody ReadRequest request) {
        ArticleReadState state = articleReadStateService.markRead(articleId, request.clientId());
        return new ReadResponse(state.articleId(), state.clientId(), state.read(), state.readAt());
    }

    record ArticleListResponse(CategoryResponse category, List<ArticleResponse> items) {
    }

    record CategoryResponse(String code, String name) {
        static CategoryResponse from(NewsCategory category) {
            return new CategoryResponse(category.name(), category.displayName());
        }
    }

    record ArticleResponse(
            String articleId,
            String title,
            String link,
            String creator,
            OffsetDateTime publishedAt,
            List<String> categories,
            boolean read
    ) {
        static ArticleResponse from(Article article) {
            return new ArticleResponse(
                    article.articleId(),
                    article.title(),
                    article.link(),
                    article.creator(),
                    article.publishedAt(),
                    article.categories().stream().map(Enum::name).toList(),
                    article.read());
        }
    }

    record ReadRequest(String clientId) {
    }

    record ReadResponse(String articleId, String clientId, boolean read, OffsetDateTime readAt) {
    }
}
