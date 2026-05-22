package com.newpulse.user;

import com.newpulse.category.NewsCategory;
import com.newpulse.common.TimeWindow;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public int upsertAll(List<UserSeedRecord> users) {
        int affected = 0;
        for (UserSeedRecord user : users) {
            affected += jdbcTemplate.update("""
                    INSERT INTO users(user_no, name, device_id, push_type, dnd_start, dnd_end)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(user_no) DO UPDATE SET
                      name = excluded.name,
                      device_id = excluded.device_id,
                      push_type = excluded.push_type,
                      dnd_start = excluded.dnd_start,
                      dnd_end = excluded.dnd_end
                    """,
                    user.userNo(),
                    user.name(),
                    user.deviceId(),
                    user.pushType().name(),
                    user.dndWindow().startText(),
                    user.dndWindow().endText());

            jdbcTemplate.update("DELETE FROM user_preferences WHERE user_no = ?", user.userNo());
            for (NewsCategory category : user.preferences()) {
                jdbcTemplate.update("""
                        INSERT OR IGNORE INTO user_preferences(user_no, category)
                        VALUES (?, ?)
                        """, user.userNo(), category.name());
            }
        }
        return affected;
    }

    public List<User> findAllWithPreferences() {
        Map<Integer, UserBase> users = new LinkedHashMap<>();
        jdbcTemplate.query("""
                SELECT user_no, name, device_id, push_type, dnd_start, dnd_end
                FROM users
                ORDER BY user_no
                """, (RowCallbackHandler) rs -> users.put(rs.getInt("user_no"), new UserBase(
                rs.getInt("user_no"),
                rs.getString("name"),
                rs.getString("device_id"),
                PushType.normalize(rs.getString("push_type")),
                timeWindow(rs.getString("dnd_start"), rs.getString("dnd_end")))));

        Map<Integer, List<NewsCategory>> preferences = new LinkedHashMap<>();
        jdbcTemplate.query("""
                SELECT user_no, category
                FROM user_preferences
                ORDER BY user_no, category
                """, (RowCallbackHandler) rs -> preferences
                .computeIfAbsent(rs.getInt("user_no"), ignored -> new ArrayList<>())
                .add(NewsCategory.fromCode(rs.getString("category"))));

        return users.values().stream()
                .map(user -> new User(
                        user.userNo,
                        user.name,
                        user.deviceId,
                        user.pushType,
                        user.dndWindow,
                        List.copyOf(preferences.getOrDefault(user.userNo, List.of()))))
                .toList();
    }

    public Map<NewsCategory, Integer> preferenceCounts() {
        Map<NewsCategory, Integer> counts = new EnumMap<>(NewsCategory.class);
        jdbcTemplate.query("""
                SELECT category, COUNT(*) AS count
                FROM user_preferences
                GROUP BY category
                """, (RowCallbackHandler) rs -> counts.put(NewsCategory.fromCode(rs.getString("category")), rs.getInt("count")));
        return counts;
    }

    private TimeWindow timeWindow(String dndStart, String dndEnd) {
        if (dndStart == null || dndEnd == null) {
            return TimeWindow.unset();
        }
        return TimeWindow.of(LocalTime.parse(dndStart), LocalTime.parse(dndEnd));
    }

    private record UserBase(
            int userNo,
            String name,
            String deviceId,
            PushType pushType,
            TimeWindow dndWindow
    ) {
    }
}
