package com.newpulse;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class TestDatabaseCleaner {

    private final JdbcTemplate jdbcTemplate;

    public TestDatabaseCleaner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public void clear() {
        jdbcTemplate.update("DELETE FROM article_read_states");
        jdbcTemplate.update("DELETE FROM push_histories");
        jdbcTemplate.update("DELETE FROM article_categories");
        jdbcTemplate.update("DELETE FROM articles");
        jdbcTemplate.update("DELETE FROM user_preferences");
        jdbcTemplate.update("DELETE FROM users");
    }
}
