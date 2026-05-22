package com.newpulse;

import com.newpulse.article.RssFeedProperties;
import java.time.Clock;
import java.time.ZoneId;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
@EnableConfigurationProperties(RssFeedProperties.class)
public class NewsPulseApplication {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    public static void main(String[] args) {
        SpringApplication.run(NewsPulseApplication.class, args);
    }

    @Bean
    Clock clock() {
        return Clock.system(SEOUL);
    }
}
