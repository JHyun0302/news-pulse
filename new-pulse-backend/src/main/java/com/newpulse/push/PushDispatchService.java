package com.newpulse.push;

import com.newpulse.article.ArticleRepository;
import com.newpulse.article.ArticleRepository.DispatchArticle;
import com.newpulse.user.PushType;
import com.newpulse.user.User;
import com.newpulse.user.UserRepository;
import java.time.Clock;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class PushDispatchService {

    private static final String SUCCESS = "success";
    private static final String FAIL = "fail";

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final PushNotificationService pushNotificationService;
    private final PushHistoryRepository pushHistoryRepository;
    private final Clock clock;

    public PushDispatchService(
            ArticleRepository articleRepository,
            UserRepository userRepository,
            PushNotificationService pushNotificationService,
            PushHistoryRepository pushHistoryRepository,
            Clock clock
    ) {
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
        this.pushNotificationService = pushNotificationService;
        this.pushHistoryRepository = pushHistoryRepository;
        this.clock = clock;
    }

    public PushDispatchResult dispatch() {
        OffsetDateTime startedAt = OffsetDateTime.now(clock);
        LocalTime now = startedAt.toLocalTime();
        List<DispatchArticle> articles = articleRepository.findDispatchArticles();
        List<User> users = userRepository.findAllWithPreferences();
        Set<String> seenInRun = new HashSet<>();

        int targetCount = 0;
        int successCount = 0;
        int failCount = 0;
        int skippedByDndCount = 0;
        int skippedDuplicateCount = 0;

        for (DispatchArticle article : articles) {
            for (User user : users) {
                if (!user.preferences().contains(article.category())) {
                    continue;
                }
                String key = user.userNo() + ":" + article.articleId();
                if (!seenInRun.add(key) || pushHistoryRepository.exists(user.userNo(), article.articleId())) {
                    skippedDuplicateCount++;
                    continue;
                }
                if (user.dndWindow().contains(now)) {
                    skippedByDndCount++;
                    continue;
                }

                String status = send(user, article);
                OffsetDateTime sentAt = OffsetDateTime.now(clock);
                boolean recorded = pushHistoryRepository.record(new PushHistory(
                        0,
                        user.userNo(),
                        user.deviceId(),
                        user.pushType(),
                        article.articleId(),
                        article.title(),
                        article.category(),
                        sentAt,
                        status));
                if (!recorded) {
                    skippedDuplicateCount++;
                    continue;
                }
                targetCount++;
                if (SUCCESS.equals(status)) {
                    successCount++;
                } else {
                    failCount++;
                }
            }
        }

        return new PushDispatchResult(
                startedAt,
                OffsetDateTime.now(clock),
                targetCount,
                successCount,
                failCount,
                skippedByDndCount,
                skippedDuplicateCount);
    }

    public List<PushHistory> recentHistories(Integer limit) {
        int normalizedLimit = limit == null ? 100 : Math.min(Math.max(limit, 1), 500);
        return pushHistoryRepository.findRecent(normalizedLimit);
    }

    private String send(User user, DispatchArticle article) {
        String status;
        if (user.pushType() == PushType.APNS) {
            status = pushNotificationService.sendAPNS(user.deviceId(), article.articleId(), article.title());
        } else {
            status = pushNotificationService.sendFCM(user.deviceId(), article.articleId(), article.title());
        }
        return SUCCESS.equals(status) || FAIL.equals(status) ? status : FAIL;
    }
}
