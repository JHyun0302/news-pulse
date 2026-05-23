package com.newpulse.article;

import com.newpulse.category.NewsCategory;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class ArticleRepository {

    private static final int MAX_ARTICLE_COUNT = 1_000;

    private final JdbcTemplate jdbcTemplate;
    private final Clock clock;

    public ArticleRepository(JdbcTemplate jdbcTemplate, Clock clock) {
        this.jdbcTemplate = jdbcTemplate;
        this.clock = clock;
    }

    @Transactional
    public ArticleSaveResult saveAll(List<RssItem> items) {
        int inserted = 0;
        int skipped = 0;
        for (RssItem item : items) {
            int articleInserted = jdbcTemplate.update("""
                    INSERT OR IGNORE INTO articles(article_id, title, link, creator, published_at, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    item.articleId(),
                    item.title(),
                    item.link(),
                    item.creator(),
                    item.publishedAt().toString(),
                    OffsetDateTime.now(clock).toString());
            if (articleInserted == 1) {
                inserted++;
            } else {
                skipped++;
            }

            String articleIdForCategory = findArticleIdByLink(item.link()).orElse(item.articleId());
            jdbcTemplate.update("""
                    INSERT OR IGNORE INTO article_categories(article_id, category)
                    VALUES (?, ?)
                    """, articleIdForCategory, item.category().name());
        }
        trimToLimit(MAX_ARTICLE_COUNT);
        return new ArticleSaveResult(inserted, skipped);
    }

    public boolean exists(String articleId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM articles WHERE article_id = ?",
                Integer.class,
                articleId);
        return count != null && count > 0;
    }

    public Optional<Article> findById(String articleId, String clientId) {
        List<ArticleRow> rows = jdbcTemplate.query("""
                SELECT a.article_id, a.title, a.link, a.creator, a.published_at,
                       CASE WHEN ? IS NOT NULL AND EXISTS (
                         SELECT 1 FROM article_read_states r
                         WHERE r.article_id = a.article_id AND r.client_id = ?
                       ) THEN 1 ELSE 0 END AS read
                FROM articles a
                WHERE a.article_id = ?
                """, this::mapArticleRow, normalizedClientId(clientId), normalizedClientId(clientId), articleId);
        if (rows.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(toArticle(rows.get(0)));
    }

    public List<Article> findByCategory(NewsCategory category, String clientId, int limit, int offset) {
        List<ArticleRow> rows = jdbcTemplate.query("""
                SELECT a.article_id, a.title, a.link, a.creator, a.published_at,
                       CASE WHEN ? IS NOT NULL AND EXISTS (
                         SELECT 1 FROM article_read_states r
                         WHERE r.article_id = a.article_id AND r.client_id = ?
                       ) THEN 1 ELSE 0 END AS read
                FROM articles a
                JOIN article_categories ac ON ac.article_id = a.article_id
                WHERE ac.category = ?
                ORDER BY a.published_at DESC, a.article_id DESC
                LIMIT ? OFFSET ?
                """, this::mapArticleRow, normalizedClientId(clientId), normalizedClientId(clientId), category.name(), limit, offset);
        return rows.stream().map(this::toArticle).toList();
    }

    public int countByCategory(NewsCategory category) {
        Integer count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM article_categories
                WHERE category = ?
                """, Integer.class, category.name());
        return count == null ? 0 : count;
    }

    public List<CategorySummary> categorySummaries(String clientId) {
        Map<NewsCategory, Integer> articleCounts = countByCategory("""
                SELECT category, COUNT(*) AS count
                FROM article_categories
                GROUP BY category
                """);

        Map<NewsCategory, Integer> readCounts = new EnumMap<>(NewsCategory.class);
        String normalizedClientId = normalizedClientId(clientId);
        if (normalizedClientId != null) {
            readCounts.putAll(countByCategory("""
                    SELECT ac.category, COUNT(*) AS count
                    FROM article_categories ac
                    JOIN article_read_states r ON r.article_id = ac.article_id
                    WHERE r.client_id = ?
                    GROUP BY ac.category
                    """, normalizedClientId));
        }

        List<CategorySummary> summaries = new ArrayList<>();
        for (NewsCategory category : NewsCategory.values()) {
            int articleCount = articleCounts.getOrDefault(category, 0);
            int readCount = readCounts.getOrDefault(category, 0);
            summaries.add(new CategorySummary(category, articleCount, Math.max(articleCount - readCount, 0)));
        }
        return summaries;
    }

    public List<DispatchArticle> findDispatchArticles() {
        return jdbcTemplate.query("""
                SELECT a.article_id, a.title, ac.category
                FROM articles a
                JOIN article_categories ac ON ac.article_id = a.article_id
                ORDER BY a.published_at DESC, a.article_id DESC
                """, (rs, rowNum) -> new DispatchArticle(
                rs.getString("article_id"),
                rs.getString("title"),
                NewsCategory.fromCode(rs.getString("category"))));
    }

    private Article toArticle(ArticleRow row) {
        return new Article(
                row.articleId,
                row.title,
                row.link,
                row.creator,
                row.publishedAt,
                findCategories(row.articleId),
                row.read);
    }

    private List<NewsCategory> findCategories(String articleId) {
        return jdbcTemplate.query("""
                SELECT category
                FROM article_categories
                WHERE article_id = ?
                ORDER BY category
                """, (rs, rowNum) -> NewsCategory.fromCode(rs.getString("category")), articleId);
    }

    private Optional<String> findArticleIdByLink(String link) {
        List<String> ids = jdbcTemplate.query(
                "SELECT article_id FROM articles WHERE link = ?",
                (rs, rowNum) -> rs.getString("article_id"),
                link);
        return ids.stream().findFirst();
    }

    private Map<NewsCategory, Integer> countByCategory(String sql, Object... args) {
        Map<NewsCategory, Integer> counts = new EnumMap<>(NewsCategory.class);
        jdbcTemplate.query(sql, rs -> {
            counts.put(NewsCategory.fromCode(rs.getString("category")), rs.getInt("count"));
        }, args);
        return counts;
    }

    private ArticleRow mapArticleRow(ResultSet rs, int rowNum) throws SQLException {
        return new ArticleRow(
                rs.getString("article_id"),
                rs.getString("title"),
                rs.getString("link"),
                rs.getString("creator"),
                OffsetDateTime.parse(rs.getString("published_at")),
                rs.getInt("read") == 1);
    }

    private String normalizedClientId(String clientId) {
        return clientId == null || clientId.isBlank() ? null : clientId.trim();
    }

    private void trimToLimit(int maxCount) {
        List<String> oldArticleIds = jdbcTemplate.query("""
                SELECT article_id
                FROM articles
                ORDER BY published_at DESC, article_id DESC
                LIMIT -1 OFFSET ?
                """, (rs, rowNum) -> rs.getString("article_id"), maxCount);
        if (oldArticleIds.isEmpty()) {
            return;
        }

        String placeholders = String.join(",", oldArticleIds.stream().map(id -> "?").toList());
        jdbcTemplate.update("DELETE FROM article_read_states WHERE article_id IN (" + placeholders + ")", oldArticleIds.toArray());
        jdbcTemplate.update("DELETE FROM article_categories WHERE article_id IN (" + placeholders + ")", oldArticleIds.toArray());
        jdbcTemplate.update("DELETE FROM articles WHERE article_id IN (" + placeholders + ")", oldArticleIds.toArray());
    }

    private record ArticleRow(
            String articleId,
            String title,
            String link,
            String creator,
            OffsetDateTime publishedAt,
            boolean read
    ) {
    }

    public record DispatchArticle(String articleId, String title, NewsCategory category) {
    }
}
