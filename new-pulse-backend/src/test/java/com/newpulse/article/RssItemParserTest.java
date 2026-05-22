package com.newpulse.article;

import static org.assertj.core.api.Assertions.assertThat;

import com.newpulse.category.NewsCategory;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

class RssItemParserTest {

    private final RssItemParser parser = new RssItemParser();

    @Test
    void RSS_item의_핵심_필드를_파싱한다() throws Exception {
        String xml = new String(new ClassPathResource("fixtures/rss-politics.xml")
                .getInputStream()
                .readAllBytes(), StandardCharsets.UTF_8);

        var items = parser.parse(xml, NewsCategory.POLITICS);

        assertThat(items).hasSize(2);
        assertThat(items.get(0).articleId()).isEqualTo("AKR20260518104500055");
        assertThat(items.get(0).title()).isEqualTo("정치 기사 첫 번째");
        assertThat(items.get(0).creator()).isEqualTo("김기자");
        assertThat(items.get(0).publishedAt().getOffset().getId()).isEqualTo("+09:00");
        assertThat(items.get(0).category()).isEqualTo(NewsCategory.POLITICS);
    }
}
