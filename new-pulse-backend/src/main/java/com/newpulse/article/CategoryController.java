package com.newpulse.article;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final ArticleService articleService;

    public CategoryController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    CategoriesResponse categories(@RequestParam(required = false) String clientId) {
        List<CategoryItemResponse> items = articleService.categorySummaries(clientId).stream()
                .map(summary -> new CategoryItemResponse(
                        summary.category().name(),
                        summary.category().displayName(),
                        summary.articleCount(),
                        summary.unreadCount()))
                .toList();
        return new CategoriesResponse(items);
    }

    record CategoriesResponse(List<CategoryItemResponse> items) {
    }

    record CategoryItemResponse(String code, String name, int articleCount, int unreadCount) {
    }
}
