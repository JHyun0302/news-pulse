package com.newpulse.category;

import java.util.Arrays;

public enum NewsCategory {
    POLITICS("정치"),
    NORTH_KOREA("북한"),
    ECONOMY("경제"),
    INDUSTRY("산업"),
    SOCIETY("사회");

    private final String displayName;

    NewsCategory(String displayName) {
        this.displayName = displayName;
    }

    public String displayName() {
        return displayName;
    }

    public static NewsCategory fromCode(String code) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("category is required");
        }
        return Arrays.stream(values())
                .filter(category -> category.name().equalsIgnoreCase(code.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("unsupported category: " + code));
    }

    public static NewsCategory fromDisplayName(String displayName) {
        if (displayName == null || displayName.isBlank()) {
            throw new IllegalArgumentException("category display name is required");
        }
        String normalized = displayName.trim();
        return Arrays.stream(values())
                .filter(category -> category.displayName.equals(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("unsupported category: " + displayName));
    }
}
