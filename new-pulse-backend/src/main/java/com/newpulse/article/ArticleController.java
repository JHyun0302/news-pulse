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
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset
    ) {
        ArticlePage page = articleService.articlesByCategory(category, clientId, limit, offset);
        List<ArticleResponse> items = page.articles().stream()
                .map(ArticleResponse::from)
                .toList();
        return new ArticleListResponse(
                CategoryResponse.from(page.category()),
                items,
                PageResponse.from(page.page()));
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

    record ArticleListResponse(CategoryResponse category, List<ArticleResponse> items, PageResponse page) {
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

    record PageResponse(int totalCount, int limit, int offset, boolean hasNext, Integer nextOffset) {
        static PageResponse from(ArticlePage.Metadata page) {
            return new PageResponse(
                    page.totalCount(),
                    page.limit(),
                    page.offset(),
                    page.hasNext(),
                    page.nextOffset());
        }
    }
}
