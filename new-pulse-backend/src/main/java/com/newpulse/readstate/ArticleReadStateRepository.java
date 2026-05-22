package com.newpulse.readstate;

import java.time.OffsetDateTime;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ArticleReadStateRepository {

    private final JdbcTemplate jdbcTemplate;

    public ArticleReadStateRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void markRead(String clientId, String articleId, OffsetDateTime readAt) {
        jdbcTemplate.update("""
                INSERT INTO article_read_states(client_id, article_id, read_at)
                VALUES (?, ?, ?)
                ON CONFLICT(client_id, article_id) DO UPDATE SET read_at = excluded.read_at
                """, clientId, articleId, readAt.toString());
    }
}
