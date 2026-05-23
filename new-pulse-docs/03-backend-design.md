# 백엔드 설계

## 기술 스택

- Java 17
- Spring Boot 4.0.6
- Maven Wrapper
- Spring Web MVC
- Spring Scheduling
- Spring JDBC 또는 JdbcClient
- SQLite JDBC
- JUnit 5, AssertJ

Spring Boot 최신 안정 버전은 2026-05-21 기준 4.0.6으로 확인했다. 공식 문서상 Java 17 이상을 요구하므로, 평가자 실행 부담을 낮추기 위해 Java 17 타깃으로 둔다.

## 패키지 구조

```text
com.newpulse
  NewsPulseApplication
  article/
    Article
    ArticleCategory
    ArticleRepository
    ArticleService
    RssFeedClient
    RssCollectScheduler
  category/
    NewsCategory
  push/
    PushNotificationService
    PushNotificationServiceImpl
    PushDispatchService
    PushHistoryRepository
  user/
    User
    UserPreference
    UserRepository
    UserImportService
  readstate/
    ArticleReadStateRepository
    ArticleReadStateService
  common/
    TimeWindow
    ArticleIdExtractor
    ApiErrorHandler
```

## 패키지 구조 설계 이유

- 계층형 패키지(`controller/service/repository`)보다 기능형 패키지(`article/user/push/readstate`)를 우선한다. 과제의 핵심 흐름이 도메인별로 명확하므로, 관련 모델·서비스·저장소가 가까이 있어야 변경 영향 범위를 좁힐 수 있다.
- 패키지 간 의존 방향은 `push -> article/user`, `readstate -> article`처럼 업무 흐름 기준으로 제한한다. 순환 의존이 생기면 패키지 경계를 잘못 잡은 것으로 보고 구조를 다시 조정한다.
- `article`: RSS 기사 수집, 저장, 조회를 묶는다. 기사 도메인은 화면 조회와 푸시 발송 양쪽에서 사용되므로 독립 모듈로 둔다.
- `category`: 카테고리 enum과 표시명을 중앙에서 관리한다. 문자열 분산을 막고 RSS URL, 사용자 선호, 화면 표시의 매핑 오류를 줄인다.
- `push`: 푸시 발송 정책, APNS/FCM 시뮬레이션, 이력 저장을 묶는다. 발송 결과 저장은 기사 조회와 별도의 책임이다.
- `user`: 사용자 원천 데이터 적재와 선호 카테고리 관리를 담당한다. 푸시 발송 서비스는 사용자 저장 방식이 아니라 조회 계약에만 의존한다.
- `readstate`: 기사 읽음 상태를 분리한다. 읽음 상태는 사용자 샘플 데이터의 user와 다른 브라우저 client 기준 상태이므로 별도 aggregate로 둔다.
- `common`: 순수 유틸리티와 공통 예외 처리만 둔다. 도메인 규칙이 커지면 `common`에 넣지 말고 해당 도메인 패키지로 이동한다.

## OOP/SOLID 적용 기준

- SRP: Controller, Service, Repository, Parser, Client 책임을 섞지 않는다.
- OCP: 푸시 발송 구현은 `PushNotificationService` 인터페이스 뒤에 둔다. 실제 APNS/FCM 연동이 필요해져도 dispatch 정책 코드를 수정하지 않게 한다.
- LSP: `PushNotificationService` 구현체는 항상 `"success"` 또는 `"fail"`을 반환하는 계약을 지킨다.
- ISP: RSS 수집, 푸시 발송, 사용자 조회 인터페이스를 큰 God service 하나로 합치지 않는다.
- DIP: `PushDispatchService`는 구체 구현체가 아니라 `PushNotificationService`, repository interface, `Clock`에 의존한다.
- 값 객체: `ArticleId`, `NewsCategory`, `TimeWindow`, `PushType`처럼 검증 규칙이 있는 값은 문자열을 직접 흘려보내지 않는다.
- 불변성: DTO와 domain record는 가능한 불변 객체로 만들고, 상태 변경은 명시적 service 메서드에서만 수행한다.
- 테스트 가능성: 현재 시각은 `Clock` 주입으로 처리한다. `LocalDateTime.now()`를 서비스 내부에서 직접 호출하지 않는다.

## 클래스 책임 기준

- `RssFeedClient`: HTTP로 RSS XML을 가져오는 책임만 가진다.
- `RssItemParser`: XML item을 domain DTO로 변환한다.
- `ArticleService`: 수집된 article 저장, 중복 제거, 조회 정책을 담당한다.
- `PushDispatchService`: 사용자-기사 매칭, DND 제외, 발송 호출 순서를 조정한다.
- `PushNotificationServiceImpl`: 성공/실패 시뮬레이션만 담당한다. DB 저장을 하지 않는다.
- `PushHistoryRepository`: 발송 이력 insert와 조회 SQL만 담당한다.
- `TimeWindow`: DND 포함 여부 판단을 캡슐화한다.

## 데이터 모델

```sql
CREATE TABLE articles (
  article_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT NOT NULL UNIQUE,
  creator TEXT,
  published_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE article_categories (
  article_id TEXT NOT NULL,
  category TEXT NOT NULL,
  PRIMARY KEY (article_id, category)
);

CREATE TABLE users (
  user_no INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  device_id TEXT NOT NULL,
  push_type TEXT NOT NULL CHECK (push_type IN ('APNS', 'FCM')),
  dnd_start TEXT,
  dnd_end TEXT
);

CREATE TABLE user_preferences (
  user_no INTEGER NOT NULL,
  category TEXT NOT NULL,
  PRIMARY KEY (user_no, category)
);

CREATE TABLE push_histories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_no INTEGER NOT NULL,
  device_id TEXT NOT NULL,
  push_type TEXT NOT NULL,
  article_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'fail')),
  UNIQUE (user_no, article_id)
);

CREATE TABLE article_read_states (
  client_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  read_at TEXT NOT NULL,
  PRIMARY KEY (client_id, article_id)
);
```

## 읽음 상태 모델 결정

- 로그인은 구현하지 않는다.
- Redis 세션 저장소도 사용하지 않는다.
- 프론트엔드는 최초 방문 시 익명 `client_id`를 생성하고 localStorage에 보관한다.
- 백엔드는 `client_id + article_id`를 기준으로 읽음 상태를 SQLite에 저장한다.
- 제공 사용자 데이터의 `user_no`는 푸시 발송 대상자 식별자로만 사용하고, 웹 읽음 상태와 연결하지 않는다.

## API 초안

```text
GET  /api/categories
GET  /api/articles?category=POLITICS&clientId=demo
GET  /api/articles/{articleId}?clientId=demo
POST /api/articles/{articleId}/read

POST /api/admin/rss/collect
POST /api/admin/push/dispatch
GET  /api/admin/push-histories?limit=100
GET  /api/health
```

관리 API는 로컬 검증과 시연을 위한 것이다. 운영 프로필에서는 CORS와 노출 범위를 제한하고, 외부에 열 필요가 없는 endpoint는 프록시에서 차단할 수 있게 경로를 `/api/admin/**`로 분리한다.

## RSS 수집

- 대상 카테고리는 정치, 북한, 경제, 산업, 사회 5개로 고정한다.
- RSS 안내 페이지의 실제 feed URL을 설정 파일에 둔다.
- item 필드에서 title, link, pubDate, dc:creator를 추출한다.
- article_id는 link 마지막 path segment에서 추출한다.
- guid는 저장하지 않는다.
- 링크 중복과 article_id 중복을 모두 방어한다.
- 수집 실패 feed가 있어도 다른 카테고리 수집은 계속한다.

## 푸시 발송

실제 구현 흐름은 아래 순서를 따른다.

1. RSS 수집으로 저장된 기사와 `article_categories`를 기준으로 발송 후보 기사를 조회한다.
2. 기사 카테고리와 `user_preferences`를 매칭해 사용자가 선호한 카테고리 기사만 대상으로 삼는다.
3. 사용자 `dnd_start`, `dnd_end`를 `TimeWindow`로 판단하고, 현재 시각이 DND 시간대에 포함되면 해당 사용자는 이번 발송에서 제외한다.
4. importer는 원천 데이터의 `APNs` 입력값을 저장 전에 `APNS`로 정규화한다. 저장 이후 dispatch 로직은 `APNS`, `FCM` 두 값만 다룬다.
5. 사용자 `push_type`이 `APNS`면 `sendAPNS`, `FCM`이면 `sendFCM`을 호출한다.
6. `PushNotificationService` 인터페이스 시그니처는 과제 요구와 동일하게 유지한다.
7. `PushNotificationServiceImpl`은 실제 외부 APNS/FCM 연동을 하지 않고 `Random` 기반으로 `"success"` 또는 `"fail"`을 반환한다.
8. 반환값은 dispatch 흐름 안에서 즉시 `push_histories`에 저장한다.
9. `push_histories`의 `UNIQUE(user_no, article_id)` 제약과 service-level 발송 전 확인으로 같은 사용자에게 같은 기사가 중복 발송되지 않게 한다.

실패 반환값은 재시도하지 않고 `fail` 상태의 발송 이력으로 저장한다. 재시도 큐를 만들면 별도 스케줄러, retry policy, backoff, idempotency, 실패 횟수 관리가 필요해져 과제 범위가 커진다. 과제 핵심은 발송 결과를 DB에 저장해 평가자가 직접 확인할 수 있는가이므로, 현재 구현은 실패도 검증 가능한 이력으로 남기는 데 집중한다.

방해 금지 시간은 `HH:mm-HH:mm` 형식으로 파싱한다. `23:00-11:00`처럼 종료가 시작보다 빠르면 자정을 넘는 구간으로 처리한다. DND 파싱 실패 사용자는 전체 dispatch를 중단시키지 않고 제외한다.

## 사용자 데이터 적재

- 개발 중 원본 Excel은 `new-pulse-backend/data/source/users.xlsx`처럼 로컬 경로에 둔다.
- 원본 Excel은 저장소에 커밋하지 않는다.
- importer는 최초 실행 또는 admin 명령으로 사용자와 선호 카테고리를 upsert한다.
- 검증용 SQLite DB와 CSV export는 별도 deliverables 경로에 둔다.
- 원본 Excel 없이도 결과를 확인할 수 있도록 DB 조회 SQL을 제공한다.

## 예외 처리 기준

- RSS feed 하나가 실패해도 전체 수집을 실패시키지 않는다. 실패 feed와 원인을 로그로 남기고 성공 feed 결과는 저장한다.
- DB unique 충돌은 중복 기사 또는 중복 발송으로 간주하고 idempotent하게 처리한다.
- DND 파싱 실패 사용자는 발송 제외하고 warning 로그를 남긴다. 잘못된 사용자 데이터가 전체 dispatch를 중단시키면 안 된다.
- 외부 URL, RSS XML, 날짜 파싱은 null/blank/invalid 케이스를 테스트한다.

## 핵심 테스트

- `ArticleIdExtractorTest`: URL 마지막 segment 추출, query string 제거
- `TimeWindowTest`: 일반 구간, 자정 넘김, 경계값, `-` 미설정
- `RssFeedParserTest`: dc:creator, pubDate, title CDATA 처리
- `ArticleRepositoryTest`: 중복 upsert, 1,000건 초과 정리
- `UserImportServiceTest`: APNs 입력값을 APNS로 정규화, 카테고리 split
- `PushDispatchServiceTest`: 선호 카테고리 매칭, DND 제외, APNS/FCM 분기, 이력 저장
- `ArticleReadStateTest`: 읽음 처리와 목록 read flag 반영
