package com.newpulse.article;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.newpulse.TestDatabaseCleaner;
import com.newpulse.category.NewsCategory;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
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
        articleRepository.saveAll(List.of(new RssItem(
                ARTICLE_ID,
                "계약 테스트 기사",
                "https://www.yna.co.kr/view/" + ARTICLE_ID,
                "계약기자",
                OffsetDateTime.of(2026, 5, 18, 12, 0, 0, 0, ZoneOffset.ofHours(9)),
                NewsCategory.POLITICS
        )));
    }

    @Test
    void 카테고리_목록_응답_shape가_API_계약과_일치한다() throws Exception {
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
                .andExpect(jsonPath("$.items[0].read", is(false)));

        mockMvc.perform(get("/api/articles/{articleId}", ARTICLE_ID).param("clientId", "qa-client"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.articleId", is(ARTICLE_ID)))
                .andExpect(jsonPath("$.read", is(false)));
    }

    @Test
    void 오류_응답_shape가_API_계약과_일치한다() throws Exception {
        mockMvc.perform(get("/api/articles"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("INVALID_REQUEST")))
                .andExpect(jsonPath("$.message", is("category is required")))
                .andExpect(jsonPath("$.timestamp", notNullValue()));
    }
}
