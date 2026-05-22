package com.newpulse.push;

import com.newpulse.category.NewsCategory;
import com.newpulse.user.PushType;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PushHistoryRepository {

    private final JdbcTemplate jdbcTemplate;

    public PushHistoryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean exists(int userNo, String articleId) {
        Integer count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM push_histories
                WHERE user_no = ? AND article_id = ?
                """, Integer.class, userNo, articleId);
        return count != null && count > 0;
    }

    public boolean record(PushHistory history) {
        int inserted = jdbcTemplate.update("""
                INSERT OR IGNORE INTO push_histories(
                  user_no, device_id, push_type, article_id, title, category, sent_at, status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                history.userNo(),
                history.deviceId(),
                history.pushType().name(),
                history.articleId(),
                history.title(),
                history.category().name(),
                history.sentAt().toString(),
                history.status());
        return inserted == 1;
    }

    public List<PushHistory> findRecent(int limit) {
        return jdbcTemplate.query("""
                SELECT id, user_no, device_id, push_type, article_id, title, category, sent_at, status
                FROM push_histories
                ORDER BY sent_at DESC, id DESC
                LIMIT ?
                """, (rs, rowNum) -> new PushHistory(
                rs.getLong("id"),
                rs.getInt("user_no"),
                rs.getString("device_id"),
                PushType.normalize(rs.getString("push_type")),
                rs.getString("article_id"),
                rs.getString("title"),
                NewsCategory.fromCode(rs.getString("category")),
                OffsetDateTime.parse(rs.getString("sent_at")),
                rs.getString("status")), limit);
    }

}
