package com.newpulse.health;

import java.time.Clock;
import java.time.OffsetDateTime;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;
    private final Clock clock;

    public HealthController(JdbcTemplate jdbcTemplate, Clock clock) {
        this.jdbcTemplate = jdbcTemplate;
        this.clock = clock;
    }

    @GetMapping
    HealthResponse health() {
        String database = "UP";
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        } catch (RuntimeException e) {
            database = "DOWN";
        }
        return new HealthResponse("UP", database, OffsetDateTime.now(clock));
    }

    record HealthResponse(String status, String database, OffsetDateTime timestamp) {
    }
}
