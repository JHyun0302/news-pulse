package com.newpulse.common;

import java.net.URI;

public final class ArticleIdExtractor {

    private ArticleIdExtractor() {
    }

    public static String extract(String link) {
        if (link == null || link.isBlank()) {
            throw new IllegalArgumentException("article link is required");
        }

        String path = parsePath(link.trim());
        while (path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }
        int lastSlash = path.lastIndexOf('/');
        String articleId = lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
        if (articleId.isBlank()) {
            throw new IllegalArgumentException("article id cannot be extracted from link");
        }
        return articleId;
    }

    private static String parsePath(String link) {
        try {
            URI uri = URI.create(link);
            if (uri.getPath() != null && !uri.getPath().isBlank()) {
                return uri.getPath();
            }
        } catch (IllegalArgumentException ignored) {
            // Fall back to simple string parsing for malformed but testable input.
        }

        int queryIndex = link.indexOf('?');
        String withoutQuery = queryIndex >= 0 ? link.substring(0, queryIndex) : link;
        int fragmentIndex = withoutQuery.indexOf('#');
        return fragmentIndex >= 0 ? withoutQuery.substring(0, fragmentIndex) : withoutQuery;
    }
}
