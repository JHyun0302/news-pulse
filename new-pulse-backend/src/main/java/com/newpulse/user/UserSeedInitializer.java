package com.newpulse.user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "news-pulse.seed", name = "import-enabled", havingValue = "true", matchIfMissing = true)
public class UserSeedInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(UserSeedInitializer.class);

    private final UserImportService userImportService;

    public UserSeedInitializer(UserImportService userImportService) {
        this.userImportService = userImportService;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        ClassPathResource seed = new ClassPathResource("seed/users.csv");
        if (!seed.exists()) {
            log.info("User seed file not found. path=seed/users.csv");
            return;
        }
        int imported = userImportService.importCsv(seed.getInputStream());
        log.info("User seed import finished. count={}", imported);
    }
}
