package com.newpulse.readstate;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.newpulse.TestDatabaseCleaner;
import com.newpulse.article.ArticleRepository;
import com.newpulse.article.RssItem;
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
class ArticleReadStateApiTest {

    private static final String ARTICLE_ID = "AKR20260518104500055";
    private static final String CLIENT_ID = "test-client";

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
                "테스트 기사",
                "https://www.yna.co.kr/view/" + ARTICLE_ID,
                "김기자",
                OffsetDateTime.of(2026, 5, 18, 12, 0, 0, 0, ZoneOffset.ofHours(9)),
                NewsCategory.POLITICS
        )));
    }

    @Test
    void 상세_진입_후_읽음_상태를_저장하고_목록에_반영한다() throws Exception {
        mockMvc.perform(get("/api/articles")
                        .param("category", "POLITICS")
                        .param("clientId", CLIENT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].read", is(false)));

        mockMvc.perform(post("/api/articles/{articleId}/read", ARTICLE_ID)
                        .contentType("application/json")
                        .content("{\"clientId\":\"" + CLIENT_ID + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.articleId", is(ARTICLE_ID)))
                .andExpect(jsonPath("$.clientId", is(CLIENT_ID)))
                .andExpect(jsonPath("$.read", is(true)));

        mockMvc.perform(get("/api/articles")
                        .param("category", "POLITICS")
                        .param("clientId", CLIENT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].read", is(true)));

        mockMvc.perform(get("/api/articles/{articleId}", ARTICLE_ID)
                        .param("clientId", CLIENT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read", is(true)));
    }
}
