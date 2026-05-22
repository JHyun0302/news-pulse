package com.newpulse.common;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class ArticleIdExtractorTest {

    @Test
    void 링크의_마지막_경로에서_article_id를_추출한다() {
        String articleId = ArticleIdExtractor.extract("https://www.yna.co.kr/view/AKR20260518104500055");

        assertThat(articleId).isEqualTo("AKR20260518104500055");
    }

    @Test
    void query_string과_fragment를_제거한다() {
        String articleId = ArticleIdExtractor.extract("https://www.yna.co.kr/view/AKR20260518104500055?input=1195m#section");

        assertThat(articleId).isEqualTo("AKR20260518104500055");
    }

    @Test
    void 빈_링크는_예외다() {
        assertThatThrownBy(() -> ArticleIdExtractor.extract(" "))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
