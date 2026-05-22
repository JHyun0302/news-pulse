package com.newpulse.admin;

import com.newpulse.article.ArticleService;
import com.newpulse.article.RssCollectResult;
import com.newpulse.push.PushDispatchResult;
import com.newpulse.push.PushDispatchService;
import com.newpulse.push.PushHistory;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ArticleService articleService;
    private final PushDispatchService pushDispatchService;

    public AdminController(ArticleService articleService, PushDispatchService pushDispatchService) {
        this.articleService = articleService;
        this.pushDispatchService = pushDispatchService;
    }

    @PostMapping("/rss/collect")
    RssCollectResult collectRss() {
        return articleService.collectRssFeeds();
    }

    @PostMapping("/push/dispatch")
    PushDispatchResult dispatchPush() {
        return pushDispatchService.dispatch();
    }

    @GetMapping("/push-histories")
    PushHistoriesResponse pushHistories(@RequestParam(required = false) Integer limit) {
        List<PushHistoryResponse> items = pushDispatchService.recentHistories(limit).stream()
                .map(PushHistoryResponse::from)
                .toList();
        return new PushHistoriesResponse(items);
    }

    record PushHistoriesResponse(List<PushHistoryResponse> items) {
    }

    record PushHistoryResponse(
            long id,
            int userNo,
            String pushType,
            String articleId,
            String title,
            String category,
            OffsetDateTime sentAt,
            String status
    ) {
        static PushHistoryResponse from(PushHistory history) {
            return new PushHistoryResponse(
                    history.id(),
                    history.userNo(),
                    history.pushType().name(),
                    history.articleId(),
                    history.title(),
                    history.category().name(),
                    history.sentAt(),
                    history.status());
        }
    }
}
