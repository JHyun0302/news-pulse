# 테스트와 QA 전략

이 문서는 테스트를 어디에 작성하고, 어떤 명령으로 검증하며, Codex가 Chrome에 연결해 직접 QA하는 절차를 정의한다.

## 테스트 작성 위치

```text
new-pulse-backend/
  src/test/java/com/newpulse/
    common/
      ArticleIdExtractorTest.java
      TimeWindowTest.java
    article/
      RssItemParserTest.java
      ArticleRepositoryTest.java
      ArticleApiTest.java
    user/
      UserImportServiceTest.java
    push/
      PushDispatchServiceTest.java
    readstate/
      ArticleReadStateApiTest.java
  src/test/resources/
    application-test.yml
    fixtures/
      rss-politics.xml
      users-sample.csv

new-pulse-frontend/
  src/
    **/*.test.ts
    **/*.test.tsx
  e2e/
    news-flow.spec.ts
  playwright.config.ts
```

## 백엔드 테스트 기준

테스트 종류:

- Unit test: article id 추출, DND 시간 판단, enum 정규화, RSS item parsing
- Repository test: SQLite schema, 중복 저장, 1,000건 초과 정리, push history unique constraint
- Service test: 사용자 선호 카테고리 매칭, DND 제외, APNS/FCM 분기, 이력 저장
- API test: 카테고리, 기사 목록, 상세, 읽음 처리, admin 수동 수집/발송

## Spring Boot 4 테스트 작성 기준

Spring Boot 4는 테스트 지원 모듈과 일부 테스트 어노테이션 패키지가 Spring Boot 3 계열과 다르다. 코드를 작성할 때 아래 기준을 따른다.

의존성:

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-test</artifactId>
  <scope>test</scope>
</dependency>
```

기본 원칙:

- JUnit Jupiter와 AssertJ를 기본으로 사용한다.
- JUnit 4 기반 테스트를 새로 만들지 않는다.
- Mockito는 외부 의존성 격리용으로만 사용하고, 도메인 순수 함수는 mock 없이 테스트한다.
- `@SpringBootTest`는 전체 context가 필요한 통합 테스트에만 사용한다.
- Controller slice 테스트는 `@WebMvcTest`를 우선 사용한다.
- JDBC repository slice 테스트는 `@JdbcTest`를 우선 사용한다.
- SQLite 동작 차이가 중요한 repository 테스트는 실제 SQLite JDBC datasource를 사용한다.

Spring Boot 4 import 기준:

```java
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.jdbc.test.autoconfigure.JdbcTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
```

Controller 테스트 예시:

```java
@WebMvcTest(ArticleController.class)
class ArticleControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    void 목록을_조회한다() throws Exception {
        mockMvc.perform(get("/api/articles")
                .param("category", "POLITICS")
                .param("clientId", "test-client"))
            .andExpect(status().isOk());
    }
}
```

Repository 테스트 예시:

```java
@JdbcTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class ArticleRepositoryTest {

    @Autowired
    JdbcClient jdbcClient;

    @Test
    void 같은_article_id는_중복_저장하지_않는다() {
        // given / when / then
    }
}
```

Service 테스트 예시:

```java
class TimeWindowTest {

    @Test
    void 자정을_넘는_DND_구간을_판단한다() {
        TimeWindow window = TimeWindow.parse("23:00-11:00");

        assertThat(window.contains(LocalTime.of(1, 0))).isTrue();
        assertThat(window.contains(LocalTime.of(12, 0))).isFalse();
    }
}
```

통합 테스트 예시:

```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ArticleReadStateApiTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    void 상세_진입_후_읽음_상태를_저장한다() throws Exception {
        // fixture insert -> POST read API -> list API read=true 검증
    }
}
```

테스트 profile 기준:

```yaml
spring:
  datasource:
    url: jdbc:sqlite:file:memdb-news-pulse-test?mode=memory&cache=shared
    driver-class-name: org.sqlite.JDBC
  sql:
    init:
      mode: always
```

테스트 작성 규칙:

- 테스트명은 한글 또는 명확한 영어 문장형으로 작성한다.
- 핵심 테스트는 given/when/then 구분을 유지한다.
- 현재 시각이 필요한 서비스는 `Clock.fixed(...)`를 주입한다.
- 랜덤 push 결과는 테스트에서 deterministic fake 구현체로 대체한다.
- RSS 테스트는 네트워크를 호출하지 않고 fixture XML을 사용한다.
- API 테스트는 응답 status뿐 아니라 JSON 필드와 DB side effect를 함께 검증한다.
- scheduler 자체보다 scheduler가 호출하는 service를 테스트한다.
- `Thread.sleep` 기반 테스트를 만들지 않는다.

명령:

```bash
cd new-pulse-backend
./mvnw test
```

필수 테스트:

- `ArticleIdExtractorTest`
- `TimeWindowTest`
- `RssItemParserTest`
- `ArticleRepositoryTest`
- `UserImportServiceTest`
- `PushDispatchServiceTest`
- `ArticleReadStateApiTest`

## 프론트엔드 테스트 기준

테스트 종류:

- Unit test: 날짜 포맷, client id 생성, API DTO 변환
- Component test: CategoryCard, ArticleListItem, StatusBadge, ErrorState, EmptyState
- Page test: category overview, article list, article detail의 로딩/에러/성공 상태
- E2E test: 카테고리 선택 -> 기사 목록 -> 기사 상세 -> 읽음 반영

명령:

```bash
cd new-pulse-frontend
npm test
npm run build
npx playwright test
```

## 통합 실행 검증

Docker Compose 기준:

```bash
docker compose up --build
```

검증 항목:

- `GET /api/health`
- `/api/categories`
- `/api/articles?category=<category>&clientId=<clientId>`
- 수동 RSS 수집 API
- 수동 push dispatch API
- SQLite articles, article_categories, push_histories, article_read_states 조회

## Codex Chrome 직접 QA

자동 테스트 통과 후 실제 Chrome에서 Codex가 직접 QA한다.

전제:

- Chrome이 실행 중이어야 한다.
- Codex Chrome Extension이 설치되고 활성화되어 있어야 한다.
- 로컬 dev server 또는 Docker Compose가 실행 중이어야 한다.

QA 절차:

1. Codex가 Chrome 연결 상태를 확인한다.
2. `http://localhost:<frontend-port>`를 Chrome에서 연다.
3. 카테고리 선택 화면에서 5개 카테고리가 보이는지 확인한다.
4. 임의 카테고리를 클릭해 기사 목록으로 이동한다.
5. 미읽음 기사 표시가 색상 외 요소로도 구분되는지 확인한다.
6. 기사 1건을 클릭해 상세 화면으로 이동한다.
7. 목록으로 돌아와 해당 기사가 읽음 상태로 바뀌었는지 확인한다.
8. 원문 열기 버튼이 새 탭을 여는지 확인한다.
9. Chrome console error를 확인한다.
10. 데스크톱과 모바일 폭에서 텍스트 겹침이 없는지 확인한다.
11. 카테고리, 리스트, 상세 화면 스크린샷을 저장한다.

Chrome 연결 실패 시:

- Chrome이 실행 중인지 확인한다.
- Codex Chrome Extension 설치/활성화 상태를 확인하도록 사용자에게 안내한다.
- native host 문제가 의심되면 Codex plugin UI에서 Chrome plugin 재설치를 안내한다.
- Chrome 연결 실패를 Playwright 통과로 대체하지 않는다. 단, 최종 일정상 불가하면 미수행 사유를 명시한다.

## QA 완료 기준

- backend `./mvnw test` 통과
- frontend `npm test` 통과
- frontend `npm run build` 통과
- Playwright E2E 통과
- Docker Compose 기동 확인
- Chrome 직접 QA 통과
- Chrome console error 없음
- 주요 화면 스크린샷 생성
