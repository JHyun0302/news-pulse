# News Pulse 백엔드

Spring Boot 기반 백엔드 모듈입니다. 연합뉴스 RSS 수집, 기사/카테고리 API, 브라우저 `client_id` 기준 읽음 상태, 사용자 선호 카테고리 기반 푸시 시뮬레이션과 이력 저장을 담당합니다.

전체 프로젝트 실행 흐름과 제출 산출물은 [루트 README](../README.md)를 기준으로 확인합니다.

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 실행 환경 | Java 17 |
| 프레임워크 | Spring Boot 4.0.6, Spring Web MVC, Spring Scheduling |
| 영속성 | Spring JDBC, SQLite |
| 테스트 | JUnit 5, AssertJ, Spring Boot Test |

## 패키지 구조

| 패키지 | 책임 |
| --- | --- |
| `article` | RSS 수집, 기사 저장/조회, 카테고리별 기사 목록, 기사 상세 API |
| `category` | 카테고리 열거형, 코드와 화면 표시명 관리 |
| `push` | 선호 카테고리 매칭, DND 제외, APNS/FCM 시뮬레이션, 발송 이력 저장 |
| `user` | 사용자 seed 적재, 선호 카테고리, 푸시 타입 정규화 |
| `readstate` | `client_id + article_id` 기준 읽음 상태 저장과 조회 |
| `common` | 공통 예외 응답, 기사 ID 추출, DND 시간 구간 처리 |
| `admin` | 로컬 검증용 RSS 수집/푸시 발송/이력 조회 API |
| `health` | 애플리케이션과 DB 상태 확인 API |

## 로컬 실행

아래 명령은 `new-pulse-backend` 디렉터리에서 실행합니다.

기본 실행:

```bash
./mvnw spring-boot:run
```

기본 API 주소는 `http://localhost:8080`입니다. 기본 SQLite 파일은 현재 모듈 디렉터리의 `news-pulse.sqlite`로 생성됩니다.

DB 경로를 바꿔 실행:

```bash
NEWS_PULSE_DB_PATH=/tmp/news-pulse.sqlite ./mvnw spring-boot:run
```

RSS 스케줄러를 끄고 실행:

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--news-pulse.rss.scheduler.enabled=false"
```

수동 검증 예시:

```bash
curl -sS http://localhost:8080/api/health
curl -sS "http://localhost:8080/api/categories?clientId=qa-client"
curl -sS "http://localhost:8080/api/articles?category=POLITICS&clientId=qa-client&limit=50&offset=0"
curl -sS -X POST http://localhost:8080/api/admin/rss/collect
curl -sS -X POST http://localhost:8080/api/admin/push/dispatch
curl -sS "http://localhost:8080/api/admin/push-histories?limit=10"
```

읽음 처리는 실제 `articleId`로 실행합니다.

```bash
curl -sS -X POST http://localhost:8080/api/articles/<articleId>/read \
  -H 'Content-Type: application/json' \
  -d '{"clientId":"qa-client"}'
```

## 테스트

아래 명령은 `new-pulse-backend` 디렉터리에서 실행합니다.

```bash
./mvnw test
```

최종 QA 기준 백엔드 테스트는 20개 통과 상태입니다.

주요 테스트 범위:

- RSS item 파싱과 `article_id` 추출
- 기사 저장, 중복 제거, 1,000건 보관 한도
- `/api/articles`, `/api/categories`, 읽음 상태 API 계약
- 사용자 seed 적재와 푸시 타입 정규화
- 선호 카테고리 매칭, DND 제외, APNS/FCM 분기, 발송 이력 저장
- DND 시간 구간 파싱과 자정 넘김 처리

## 주요 API

기본 경로는 `/api`입니다. 상세 요청/응답 계약은 [API Contract](../new-pulse-docs/07-api-contract.md)를 기준으로 합니다.

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `GET` | `/api/health` | 애플리케이션과 DB 상태 확인 |
| `GET` | `/api/categories?clientId=...` | 5개 카테고리와 기사/미읽음 수 |
| `GET` | `/api/articles?category=POLITICS&clientId=...&limit=50&offset=0` | 카테고리별 최신순 기사 목록과 페이지 메타데이터 |
| `GET` | `/api/articles/{articleId}?clientId=...` | 기사 상세 메타데이터 |
| `POST` | `/api/articles/{articleId}/read` | `client_id + article_id` 기준 읽음 처리 |
| `POST` | `/api/admin/rss/collect` | RSS 수동 수집 |
| `POST` | `/api/admin/push/dispatch` | 푸시 발송 시뮬레이션 수동 실행 |
| `GET` | `/api/admin/push-histories?limit=100` | 발송 이력 조회 |

## SQLite

- 로컬 기본 DB 경로: `new-pulse-backend/news-pulse.sqlite`
- schema 위치: [src/main/resources/schema.sql](src/main/resources/schema.sql)
- seed 위치: [src/main/resources/seed/users.csv](src/main/resources/seed/users.csv)

주요 테이블:

| 테이블 | 역할 |
| --- | --- |
| `articles` | 기사 메타데이터 |
| `article_categories` | 기사와 카테고리 다대다 매핑 |
| `users` | 푸시 발송 대상 사용자 seed |
| `user_preferences` | 사용자 선호 카테고리 |
| `push_histories` | APNS/FCM 시뮬레이션 발송 결과 |
| `article_read_states` | 브라우저 `client_id` 기준 읽음 상태 |

제출용 DB/CSV 산출물은 [루트 README](../README.md)와 [deliverables README](deliverables/README.md)를 참고합니다.

CSV 내보내기:

```bash
python3 scripts/export_deliverables.py --db news-pulse.sqlite --out deliverables
```

SQLite 복사본까지 포함해야 할 때:

```bash
python3 scripts/export_deliverables.py --db news-pulse.sqlite --out deliverables --include-db-copy
```

## RSS와 푸시 구현

- RSS 피드는 정치, 북한, 경제, 산업, 사회 5개 카테고리로 고정합니다.
- 스케줄러는 10분 간격으로 RSS를 수집합니다.
- RSS link에서 추출한 `article_id`로 중복 기사를 제거합니다.
- 기사 저장 한도는 최대 1,000건이며 초과 시 오래된 기사부터 정리합니다.
- 사용자 seed는 100명이며, 각 사용자의 선호 카테고리와 신규 기사 카테고리를 매칭합니다.
- 현재 시각이 사용자 DND 시간대에 포함되면 해당 발송은 건너뜁니다.
- `push_type`에 따라 APNS 또는 FCM 경로로 분기하고, 실제 외부 연동 대신 `Random` 기반 `success`/`fail`을 반환합니다.
- 반환 결과는 즉시 `push_histories`에 저장합니다.
- `UNIQUE(user_no, article_id)` 제약과 서비스 계층 확인으로 같은 사용자에게 같은 기사를 중복 발송하지 않습니다.

실패 재시도 큐는 구현하지 않았습니다. 재시도 큐를 추가하면 별도 스케줄러, backoff, idempotency, 실패 횟수 관리가 필요해 과제 범위를 넓히므로, 성공과 실패를 모두 검증 가능한 이력으로 남기는 데 집중했습니다.

## 설계 판단

- SQLite schema와 SQL을 평가자가 직접 확인하기 쉽도록 JPA 대신 Spring JDBC를 사용했습니다.
- 로그인/JWT/session 없이 브라우저 익명 `client_id`와 `article_id` 조합으로 읽음 상태를 저장합니다.
- 제공 사용자 데이터는 웹 계정이 아니라 푸시 발송 대상 seed로만 사용합니다.
- `/api/admin/**`는 로컬 검증과 시연용입니다. OCI public edge에서는 보안 정책상 Nginx가 해당 경로를 차단합니다.
- OCI 배포 상세는 [OCI Deployment](../new-pulse-docs/05-deployment-oci.md)를 참고합니다.
