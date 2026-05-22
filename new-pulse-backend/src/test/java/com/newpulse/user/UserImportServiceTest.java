package com.newpulse.user;

import static org.assertj.core.api.Assertions.assertThat;

import com.newpulse.TestDatabaseCleaner;
import com.newpulse.category.NewsCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class UserImportServiceTest {

    @Autowired
    UserImportService userImportService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    TestDatabaseCleaner databaseCleaner;

    @BeforeEach
    void setUp() {
        databaseCleaner.clear();
    }

    @Test
    void CSV_seed를_읽고_APNs를_APNS로_정규화한다() throws Exception {
        int count = userImportService.importCsv(new ClassPathResource("fixtures/users-sample.csv").getInputStream());

        assertThat(count).isEqualTo(3);
        var users = userRepository.findAllWithPreferences();
        assertThat(users).hasSize(3);
        assertThat(users.get(0).pushType()).isEqualTo(PushType.APNS);
        assertThat(users.get(0).preferences()).containsExactlyInAnyOrder(NewsCategory.POLITICS, NewsCategory.ECONOMY);
        assertThat(users.get(1).dndWindow().enabled()).isTrue();
    }
}
