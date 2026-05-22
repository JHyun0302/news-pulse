package com.newpulse.user;

import com.newpulse.category.NewsCategory;
import com.newpulse.common.TimeWindow;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class UserImportService {

    private static final int COLUMN_COUNT = 6;

    private final UserRepository userRepository;

    public UserImportService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public int importCsv(InputStream inputStream) {
        List<UserSeedRecord> users = parse(inputStream);
        userRepository.upsertAll(users);
        return users.size();
    }

    public List<UserSeedRecord> parse(InputStream inputStream) {
        if (inputStream == null) {
            throw new IllegalArgumentException("user seed csv is required");
        }
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String header = reader.readLine();
            if (header == null) {
                return List.of();
            }

            List<UserSeedRecord> users = new ArrayList<>();
            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank()) {
                    continue;
                }
                List<String> columns = parseLine(line);
                if (columns.size() != COLUMN_COUNT) {
                    throw new IllegalArgumentException("invalid user seed column count at line " + lineNumber);
                }
                users.add(toRecord(columns, lineNumber));
            }
            return users;
        } catch (IOException e) {
            throw new IllegalArgumentException("user seed csv cannot be read", e);
        }
    }

    private UserSeedRecord toRecord(List<String> columns, int lineNumber) {
        try {
            return new UserSeedRecord(
                    Integer.parseInt(columns.get(0).trim()),
                    required(columns.get(1), "name"),
                    required(columns.get(2), "device_id"),
                    PushType.normalize(columns.get(3)),
                    parseCategories(columns.get(4)),
                    TimeWindow.parse(columns.get(5))
            );
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("invalid user seed at line " + lineNumber + ": " + e.getMessage(), e);
        }
    }

    private List<NewsCategory> parseCategories(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("categories are required");
        }
        List<NewsCategory> categories = new ArrayList<>();
        for (String token : value.split(",")) {
            if (!token.isBlank()) {
                categories.add(NewsCategory.fromDisplayName(token.trim()));
            }
        }
        if (categories.isEmpty()) {
            throw new IllegalArgumentException("categories are required");
        }
        return List.copyOf(categories);
    }

    private String required(String value, String name) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(name + " is required");
        }
        return value.trim();
    }

    private List<String> parseLine(String line) {
        List<String> columns = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean quoted = false;
        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);
            if (ch == '"') {
                if (quoted && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    quoted = !quoted;
                }
            } else if (ch == ',' && !quoted) {
                columns.add(current.toString());
                current.setLength(0);
            } else {
                current.append(ch);
            }
        }
        columns.add(current.toString());
        return columns;
    }
}
