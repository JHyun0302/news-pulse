package com.newpulse.article;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.newpulse.TestDatabaseCleaner;
import com.newpulse.category.NewsCategory;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.IntStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ArticleApiContractTest {

    private static final String ARTICLE_ID = "AKR20260518104500055";

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ArticleRepository articleRepository;

    @Autowired
    TestDatabaseCleaner databaseCleaner;

    @BeforeEach
    void setUp() {
        databaseCleaner.clear();
    }

    @Test
    void 카테고리_목록_응답_shape가_API_계약과_일치한다() throws Exception {
        savePoliticsArticle(ARTICLE_ID, 0);

        mockMvc.perform(get("/api/categories").param("clientId", "qa-client"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(5)))
                .andExpect(jsonPath("$.items[0].code", is("POLITICS")))
                .andExpect(jsonPath("$.items[0].name", is("정치")))
                .andExpect(jsonPath("$.items[0].articleCount", is(1)))
                .andExpect(jsonPath("$.items[0].unreadCount", is(1)));
    }

    @Test
    void 기사_목록과_상세_응답_shape가_API_계약과_일치한다() throws Exception {
        savePoliticsArticle(ARTICLE_ID, 0);

        mockMvc.perform(get("/api/articles")
                        .param("category", "POLITICS")
                        .param("clientId", "qa-client")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.category.code", is("POLITICS")))
                .andExpect(jsonPath("$.category.name", is("정치")))
                .andExpect(jsonPath("$.items[0].articleId", is(ARTICLE_ID)))
                .andExpect(jsonPath("$.items[0].title", is("계약 테스트 기사")))
                .andExpect(jsonPath("$.items[0].link", is("https://www.yna.co.kr/view/" + ARTICLE_ID)))
                .andExpect(jsonPath("$.items[0].creator", is("계약기자")))
                .andExpect(jsonPath("$.items[0].publishedAt", notNullValue()))
                .andExpect(jsonPath("$.items[0].categories[0]", is("POLITICS")))
                .andExpect(jsonPath("$.items[0].read", is(false)))
                .andExpect(jsonPath("$.page.totalCount", is(1)))
                .andExpect(jsonPath("$.page.limit", is(5)))
                .andExpect(jsonPath("$.page.offset", is(0)))
                .andExpect(jsonPath("$.page.hasNext", is(false)))
                .andExpect(jsonPath("$.page.nextOffset", nullValue()));

        mockMvc.perform(get("/api/articles/{articleId}", ARTICLE_ID).param("clientId", "qa-client"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.articleId", is(ARTICLE_ID)))
                .andExpect(jsonPath("$.read", is(false)));
    }

    @Test
    void 기사_목록은_기본_offset_0과_limit_50을_사용한다() throws Exception {
        savePoliticsArticle(ARTICLE_ID, 0);

        mockMvc.perform(get("/api/articles")
                        .param("category", "POLITICS")
                        .param("clientId", "qa-client"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.page.totalCount", is(1)))
                .andExpect(jsonPath("$.page.limit", is(50)))
                .andExpect(jsonPath("$.page.offset", is(0)))
                .andExpect(jsonPath("$.page.hasNext", is(false)))
                .andExpect(jsonPath("$.page.nextOffset", nullValue()));
    }

    @Test
    void 기사_목록_limit은_최대_100으로_제한된다() throws Exception {
        savePoliticsArticles(101);

        mockMvc.perform(get("/api/articles")
                        .param("category", "POLITICS")
                        .param("limit", "200"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(100)))
                .andExpect(jsonPath("$.items[0].articleId", is(articleId(100))))
                .andExpect(jsonPath("$.page.totalCount", is(101)))
                .andExpect(jsonPath("$.page.limit", is(100)))
                .andExpect(jsonPath("$.page.offset", is(0)))
                .andExpect(jsonPath("$.page.hasNext", is(true)))
                .andExpect(jsonPath("$.page.nextOffset", is(100)));
    }

    @Test
    void 기사_목록_offset을_적용해_다음_page를_반환한다() throws Exception {
        savePoliticsArticles(3);

        mockMvc.perform(get("/api/articles")
                        .param("category", "POLITICS")
                        .param("limit", "2")
                        .param("offset", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].articleId", is(articleId(0))))
                .andExpect(jsonPath("$.page.totalCount", is(3)))
                .andExpect(jsonPath("$.page.limit", is(2)))
                .andExpect(jsonPath("$.page.offset", is(2)))
                .andExpect(jsonPath("$.page.hasNext", is(false)))
                .andExpect(jsonPath("$.page.nextOffset", nullValue()));
    }

    @Test
    void 기사_목록_offset이_음수면_400을_반환한다() throws Exception {
        mockMvc.perform(get("/api/articles")
                        .param("category", "POLITICS")
                        .param("offset", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("INVALID_REQUEST")))
                .andExpect(jsonPath("$.message", is("offset must be zero or positive")))
                .andExpect(jsonPath("$.timestamp", notNullValue()));
    }

    @Test
    void 오류_응답_shape가_API_계약과_일치한다() throws Exception {
        mockMvc.perform(get("/api/articles"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("INVALID_REQUEST")))
                .andExpect(jsonPath("$.message", is("category is required")))
                .andExpect(jsonPath("$.timestamp", notNullValue()));
    }

    private void savePoliticsArticles(int count) {
        articleRepository.saveAll(IntStream.range(0, count)
                .mapToObj(index -> item(articleId(index), "페이징 기사 " + index, index))
                .toList());
    }

    private void savePoliticsArticle(String articleId, int minute) {
        articleRepository.saveAll(List.of(item(articleId, "계약 테스트 기사", minute)));
    }

    private RssItem item(String articleId, String title, int minute) {
        return new RssItem(
                articleId,
                title,
                "https://www.yna.co.kr/view/" + articleId,
                "계약기자",
                OffsetDateTime.of(2026, 5, 18, 12, 0, 0, 0, ZoneOffset.ofHours(9)).plusMinutes(minute),
                NewsCategory.POLITICS);
    }

    private String articleId(int index) {
        return "AKR202605181045%05d".formatted(index);
    }
}
