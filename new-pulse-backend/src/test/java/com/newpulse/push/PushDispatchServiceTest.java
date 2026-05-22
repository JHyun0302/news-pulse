package com.newpulse.push;

import static org.assertj.core.api.Assertions.assertThat;

import com.newpulse.TestDatabaseCleaner;
import com.newpulse.article.ArticleRepository;
import com.newpulse.article.RssItem;
import com.newpulse.category.NewsCategory;
import com.newpulse.common.TimeWindow;
import com.newpulse.user.PushType;
import com.newpulse.user.UserRepository;
import com.newpulse.user.UserSeedRecord;
import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class PushDispatchServiceTest {

    private static final Clock FIXED_CLOCK = Clock.fixed(
            Instant.parse("2026-05-21T03:00:00Z"),
            ZoneId.of("Asia/Seoul"));

    @Autowired
    ArticleRepository articleRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PushHistoryRepository pushHistoryRepository;

    @Autowired
    TestDatabaseCleaner databaseCleaner;

    @BeforeEach
    void setUp() {
        databaseCleaner.clear();
    }

    @Test
    void 선호_카테고리_DND_push_type에_따라_발송하고_이력을_저장한다() {
        articleRepository.saveAll(List.of(item("AKR20260518104500055", NewsCategory.POLITICS)));
        userRepository.upsertAll(List.of(
                new UserSeedRecord(1, "apns user", "device-apns", PushType.APNS, List.of(NewsCategory.POLITICS), TimeWindow.unset()),
                new UserSeedRecord(2, "fcm user", "device-fcm", PushType.FCM, List.of(NewsCategory.POLITICS), TimeWindow.unset()),
                new UserSeedRecord(3, "dnd user", "device-dnd", PushType.FCM, List.of(NewsCategory.POLITICS), TimeWindow.parse("11:00-14:00")),
                new UserSeedRecord(4, "unmatched user", "device-unmatched", PushType.FCM, List.of(NewsCategory.ECONOMY), TimeWindow.unset())
        ));
        FakePushNotificationService fake = new FakePushNotificationService();
        PushDispatchService service = new PushDispatchService(articleRepository, userRepository, fake, pushHistoryRepository, FIXED_CLOCK);

        PushDispatchResult result = service.dispatch();

        assertThat(result.targetCount()).isEqualTo(2);
        assertThat(result.successCount()).isEqualTo(1);
        assertThat(result.failCount()).isEqualTo(1);
        assertThat(result.skippedByDndCount()).isEqualTo(1);
        assertThat(fake.apnsCalls).isEqualTo(1);
        assertThat(fake.fcmCalls).isEqualTo(1);
        assertThat(pushHistoryRepository.findRecent(10)).hasSize(2);
    }

    @Test
    void 같은_user_article은_중복_발송하지_않는다() {
        articleRepository.saveAll(List.of(
                item("AKR20260518104500055", NewsCategory.POLITICS),
                item("AKR20260518104500055", NewsCategory.ECONOMY)
        ));
        userRepository.upsertAll(List.of(
                new UserSeedRecord(
                        1,
                        "apns user",
                        "device-apns",
                        PushType.APNS,
                        List.of(NewsCategory.POLITICS, NewsCategory.ECONOMY),
                        TimeWindow.unset())
        ));
        FakePushNotificationService fake = new FakePushNotificationService();
        PushDispatchService service = new PushDispatchService(articleRepository, userRepository, fake, pushHistoryRepository, FIXED_CLOCK);

        PushDispatchResult first = service.dispatch();
        PushDispatchResult second = service.dispatch();

        assertThat(first.targetCount()).isEqualTo(1);
        assertThat(first.skippedDuplicateCount()).isEqualTo(1);
        assertThat(second.targetCount()).isZero();
        assertThat(second.skippedDuplicateCount()).isEqualTo(2);
        assertThat(pushHistoryRepository.findRecent(10)).hasSize(1);
    }

    private RssItem item(String articleId, NewsCategory category) {
        return new RssItem(
                articleId,
                "title " + articleId,
                "https://www.yna.co.kr/view/" + articleId,
                "creator",
                OffsetDateTime.of(2026, 5, 18, 12, 0, 0, 0, ZoneOffset.ofHours(9)),
                category);
    }

    static class FakePushNotificationService implements PushNotificationService {
        int apnsCalls;
        int fcmCalls;

        @Override
        public String sendAPNS(String device_id, String article_id, String title) {
            apnsCalls++;
            return "success";
        }

        @Override
        public String sendFCM(String device_id, String article_id, String title) {
            fcmCalls++;
            return "fail";
        }
    }
}
