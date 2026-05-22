package com.newpulse.article;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class RssFeedClient {

    private final RestClient restClient;

    public RssFeedClient() {
        this.restClient = RestClient.create();
    }

    public String fetch(String url) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("rss feed url is required");
        }
        return restClient.get()
                .uri(url)
                .retrieve()
                .body(String.class);
    }
}
