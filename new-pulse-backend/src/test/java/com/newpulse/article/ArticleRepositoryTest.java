package com.newpulse.article;

import static org.assertj.core.api.Assertions.assertThat;

import com.newpulse.TestDatabaseCleaner;
import com.newpulse.category.NewsCategory;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ArticleRepositoryTest {

    @Autowired
    ArticleRepository articleRepository;

    @Autowired
    TestDatabaseCleaner databaseCleaner;

    @BeforeEach
    void setUp() {
        databaseCleaner.clear();
    }

    @Test
    void 같은_article_id는_중복_저장하지_않는다() {
        RssItem first = item("AKR20260518104500055", 1);
        RssItem duplicate = item("AKR20260518104500055", 1);

        ArticleSaveResult result = articleRepository.saveAll(List.of(first, duplicate));

        assertThat(result.newArticleCount()).isEqualTo(1);
        assertThat(result.skippedDuplicateCount()).isEqualTo(1);
        assertThat(articleRepository.findByCategory(NewsCategory.POLITICS, null, 10, 0)).hasSize(1);
    }

    @Test
    void 기사는_최대_1000건까지만_보관한다() {
        List<RssItem> items = new ArrayList<>();
        for (int i = 0; i < 1_005; i++) {
            items.add(item("AKR20260518%07d".formatted(i), i));
        }

        articleRepository.saveAll(items);

        assertThat(articleRepository.categorySummaries(null))
                .filteredOn(summary -> summary.category() == NewsCategory.POLITICS)
                .singleElement()
                .extracting(CategorySummary::articleCount)
                .isEqualTo(1_000);
        assertThat(articleRepository.exists("AKR202605180000000")).isFalse();
    }

    private RssItem item(String articleId, int minute) {
        return new RssItem(
                articleId,
                "title " + articleId,
                "https://www.yna.co.kr/view/" + articleId,
                "creator",
                OffsetDateTime.of(2026, 5, 18, 12, 0, 0, 0, ZoneOffset.ofHours(9)).plusMinutes(minute),
                NewsCategory.POLITICS);
    }
}
