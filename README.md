# News Pulse

연합뉴스 RSS를 수집해 카테고리별 뉴스 열람 화면과 개인화 푸시 알림 시뮬레이션을 제공하는 풀스택 과제 프로젝트입니다. 두 과제의 공통 데이터 소스를 하나의 Spring Boot 백엔드와 React 프론트엔드로 통합했습니다.

## 핵심 기능

- 정치, 북한, 경제, 산업, 사회 RSS 피드 수집
- 기사 `article_id` 기준 중복 제거와 최대 1,000건 저장
- 카테고리별 최신순 기사 목록, 50건 단위 더보기, 기사 상세, 원문 새 탭 열기
- 브라우저 익명 `client_id` 기준 읽음 상태 저장
- 사용자 선호 카테고리와 DND 시간대 기반 푸시 대상 선별
- APNS/FCM 발송 시뮬레이션과 발송 이력 SQLite 저장
- 로컬 Docker Compose와 OCI `edge-vm -> front-vm -> back-vm` 배포 파일

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| Backend | Java 17, Spring Boot 4.0.6, Spring Web MVC, Spring Scheduling, Spring JDBC, SQLite |
| Frontend | React 19, TypeScript, Vite 8, React Router, TanStack Query, Tailwind CSS 4, lucide-react |
| Test/QA | JUnit 5, AssertJ, Vitest, React Testing Library, Playwright, Chrome 직접 QA |
| Infra | Docker, Docker Compose, Nginx, OCI VM 분리 배포 |

## 아키텍처

![News Pulse OCI Architecture](new-pulse-docs/assets/oci-architecture.svg)

```text
Browser -> front-vm Nginx -> /api proxy -> back-vm Spring Boot -> SQLite
                                      └-> RSS collector / push dispatcher
```

- 프론트엔드는 같은 origin의 `/api`만 호출합니다.
- 로컬 개발에서는 Vite dev server가 `/api`를 백엔드로 프록시합니다.
- Docker/OCI에서는 Nginx가 정적 파일을 서빙하고 `/api`를 백엔드로 프록시합니다.
- 백엔드는 RSS 수집, 사용자 seed 적재, 푸시 시뮬레이션, API를 한 애플리케이션에서 담당합니다.

## 프로젝트 구조

```text
new-pulse-backend/     Spring Boot backend, schema, seed, export script
new-pulse-frontend/    React/Vite frontend and Playwright tests
deploy/                OCI edge/front/back compose and Nginx files
new-pulse-docs/        architecture, API contract, QA, deployment docs
screenshots/           README and QA screenshots
docker-compose.local.yml
```

## 로컬 실행: Docker Compose

루트에서 실행합니다.

```bash
docker compose -f docker-compose.local.yml -p news-pulse up --build
```

확인:

```bash
curl -fsS http://localhost:3000/healthz
curl -fsS http://localhost:3000/api/health
curl -fsS http://localhost:8080/api/health
```

접속 URL:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

로컬 compose는 SQLite를 Docker named volume `news-pulse-sqlite`에 저장합니다. 컨테이너를 재생성해도 volume을 삭제하지 않으면 DB 파일은 유지됩니다.

## 로컬 실행: Backend Dev

```bash
cd new-pulse-backend
./mvnw spring-boot:run -Dspring-boot.run.arguments="--news-pulse.rss.scheduler.enabled=false"
```

기본 DB 경로는 `new-pulse-backend/news-pulse.sqlite`입니다. 다른 경로를 쓰려면 `NEWS_PULSE_DB_PATH`를 지정합니다.

```bash
NEWS_PULSE_DB_PATH=/tmp/news-pulse.sqlite ./mvnw spring-boot:run
```

수동 수집과 발송:

```bash
curl -sS -X POST http://localhost:8080/api/admin/rss/collect
curl -sS -X POST http://localhost:8080/api/admin/push/dispatch
curl -sS "http://localhost:8080/api/admin/push-histories?limit=10"
```

## 로컬 실행: Frontend Dev

백엔드를 먼저 `localhost:8080`에서 실행한 뒤 프론트엔드를 시작합니다.

```bash
cd new-pulse-frontend
npm install
npm run dev -- --port 5173
```

접속 URL:

```text
http://localhost:5173/
```

백엔드 포트가 다르면 Vite proxy 대상만 바꿉니다.

```bash
VITE_DEV_API_TARGET=http://localhost:18081 npm run dev -- --port 5173
```

## 테스트와 QA

Backend:

```bash
cd new-pulse-backend
./mvnw test
```

Frontend:

```bash
cd new-pulse-frontend
npm test
npm run build
```

Playwright E2E는 백엔드가 실행 중인 상태에서 실행합니다.

```bash
cd new-pulse-frontend
npx playwright test
```

최종 QA 기록:

- Backend test: 20 tests 통과
- Frontend test: 20 tests 통과
- Frontend build 통과
- Playwright: 2 tests 통과
- Docker Compose local: backend/frontend `healthy`
- Chrome 직접 QA: 카테고리 -> 목록 -> 상세 -> `연합뉴스 원문 보기` 새 탭 -> 읽음 반영 확인
- Chrome console error: 0건

## 주요 API

Base path는 `/api`입니다.

| Method | Path | 설명 |
| --- | --- | --- |
| `GET` | `/api/health` | 애플리케이션과 DB 상태 확인 |
| `GET` | `/api/categories?clientId=...` | 5개 카테고리와 기사/미읽음 수 |
| `GET` | `/api/articles?category=POLITICS&clientId=...&limit=50&offset=0` | 카테고리별 최신순 기사 목록과 page metadata |
| `GET` | `/api/articles/{articleId}?clientId=...` | 기사 상세 메타데이터 |
| `POST` | `/api/articles/{articleId}/read` | `client_id + article_id` 기준 읽음 처리 |
| `POST` | `/api/admin/rss/collect` | RSS 수동 수집 |
| `POST` | `/api/admin/push/dispatch` | 푸시 발송 시뮬레이션 수동 실행 |
| `GET` | `/api/admin/push-histories?limit=100` | 발송 이력 조회 |

상세 계약은 [API Contract](new-pulse-docs/07-api-contract.md)를 기준으로 합니다.

## 푸시 시뮬레이션 구현

백엔드는 RSS 수집 기사와 사용자 선호 카테고리를 매칭한 뒤, DND 시간대에 포함되는 사용자를 제외합니다. 남은 대상은 `push_type`에 따라 APNS 또는 FCM 경로로 분기합니다. `PushNotificationService` 인터페이스 시그니처는 과제 요구와 동일하게 유지했고, 구현체는 실제 외부 연동 없이 `Random` 기반으로 `success` 또는 `fail`을 반환합니다. 반환값은 즉시 `push_histories`에 저장하며, `UNIQUE(user_no, article_id)` 제약과 service-level 확인으로 같은 사용자에게 같은 기사가 중복 발송되지 않게 했습니다. 원천 데이터의 `APNs` 입력은 importer에서 `APNS`로 정규화합니다.

실패 결과는 재시도 큐에 넣지 않고 `fail` 상태의 발송 이력으로 저장합니다. 재시도 큐를 만들면 별도 스케줄러, retry policy, backoff, idempotency, 실패 횟수 관리까지 필요해져 과제 범위를 크게 넓히기 때문입니다. 본 과제의 핵심은 발송 결과를 SQLite에 저장해 평가자가 직접 확인할 수 있는가이므로, 성공과 실패를 모두 검증 가능한 이력으로 남기는 데 집중했습니다.

핵심 구현 위치:

| 요구사항 | 구현 위치 |
| --- | --- |
| APNS/FCM 인터페이스와 랜덤 성공/실패 구현 | [PushNotificationService.java](new-pulse-backend/src/main/java/com/newpulse/push/PushNotificationService.java), [PushNotificationServiceImpl.java](new-pulse-backend/src/main/java/com/newpulse/push/PushNotificationServiceImpl.java) |
| 선호 카테고리 매칭, DND 제외, 중복 확인, 이력 저장 흐름 | [PushDispatchService.java](new-pulse-backend/src/main/java/com/newpulse/push/PushDispatchService.java) |
| `UNIQUE(user_no, article_id)` 중복 발송 방어 | [schema.sql](new-pulse-backend/src/main/resources/schema.sql) |
| `APNs` 입력값을 `APNS`로 정규화 | [PushType.java](new-pulse-backend/src/main/java/com/newpulse/user/PushType.java), [UserImportService.java](new-pulse-backend/src/main/java/com/newpulse/user/UserImportService.java) |

## DB와 산출물

SQLite schema는 [schema.sql](new-pulse-backend/src/main/resources/schema.sql)로 직접 초기화합니다.

주요 테이블:

| 테이블 | 역할 |
| --- | --- |
| `articles` | 기사 메타데이터 |
| `article_categories` | 기사와 카테고리 다대다 매핑 |
| `users` | 푸시 발송 대상 사용자 seed |
| `user_preferences` | 사용자 선호 카테고리 |
| `push_histories` | APNS/FCM 시뮬레이션 발송 결과 |
| `article_read_states` | 브라우저 `client_id` 기준 읽음 상태 |

QA 산출물 위치:

```text
new-pulse-backend/deliverables/
  articles.csv
  article_categories.csv
  push_histories.csv
  table-counts.csv
  article-category-counts.csv
  push-history-status-counts.csv
  article_read_states.csv
  export-summary.csv
  news-pulse-qa.sqlite
```

평가용 SQLite DB 파일은 `new-pulse-backend/deliverables/news-pulse-qa.sqlite`입니다. CSV 산출물은 `new-pulse-backend/deliverables/` 아래에 함께 포함되어 있으며, SQLite 확인은 아래 `sqlite3` 예시 SQL을 그대로 실행하면 됩니다.

현재 QA 산출물 요약:

| 항목 | 건수 |
| --- | ---: |
| articles | 463 |
| article_categories | 565 |
| users | 100 |
| user_preferences | 300 |
| push_histories | 19,960 |
| article_read_states | 40 |

CSV export 명령:

```bash
cd new-pulse-backend
python3 scripts/export_deliverables.py --db news-pulse.sqlite --out deliverables
```

SQLite 복사본까지 생성해야 할 때만 명시적으로 옵션을 추가합니다.

```bash
python3 scripts/export_deliverables.py --db news-pulse.sqlite --out deliverables --include-db-copy
```

DB 확인 예시:

```bash
sqlite3 new-pulse-backend/deliverables/news-pulse-qa.sqlite \
  "SELECT COUNT(*) FROM articles;"

sqlite3 new-pulse-backend/deliverables/news-pulse-qa.sqlite \
  "SELECT status, COUNT(*) FROM push_histories GROUP BY status;"

sqlite3 new-pulse-backend/deliverables/news-pulse-qa.sqlite \
  "SELECT user_no, article_id, COUNT(*) FROM push_histories GROUP BY user_no, article_id HAVING COUNT(*) > 1;"
```

마지막 중복 확인 SQL은 결과가 없어야 정상입니다.

## 스크린샷

### 카테고리 선택

![Category overview](screenshots/category-overview.png)

### 기사 목록과 읽음 상태

![Article list read state](screenshots/article-list-read-state.png)

### 더보기 후 기사 목록

![Article list after pagination](screenshots/pagination-after-more-read-state.png)

### 기사 상세

![Article detail](screenshots/article-detail.png)

### 모바일 목록

![Mobile article list](screenshots/mobile-article-list.png)

## OCI 배포 요약

배포 파일은 VM 역할별로 분리되어 있습니다.

```text
deploy/
  edge/nginx.conf
  front/docker-compose.yml
  front/nginx.conf
  front/.env.example
  back/docker-compose.yml
  back/.env.example
```

이미지 빌드:

```bash
docker build -f new-pulse-backend/Dockerfile -t news-pulse-backend:latest .
docker build -f new-pulse-frontend/Dockerfile -t news-pulse-frontend:latest .
```

운영 기준:

- edge-vm만 public 80/443을 엽니다.
- front-vm은 edge-vm에서 오는 HTTP만 받습니다.
- back-vm은 front-vm에서 오는 backend port만 받습니다.
- SQLite는 back-vm host volume `/opt/news-pulse/data`에 둡니다.
- 운영 `.env`와 runtime DB는 저장소에 커밋하지 않습니다.

자세한 배포 절차는 [OCI Deployment](new-pulse-docs/05-deployment-oci.md)를 참고합니다.

배포 확인 URL:

- [http://138.2.43.7](http://138.2.43.7)
- 현재는 HTTP public IP로 확인하는 제출용 배포입니다. TLS와 도메인은 구성하지 않았습니다.

## 주요 설계 판단

- 로그인, JWT, 세션, Redis는 구현하지 않았습니다.
- 웹 읽음 상태는 브라우저 localStorage의 익명 `client_id`와 `article_id` 조합으로 SQLite에 저장합니다.
- 제공 사용자 데이터는 웹 로그인 사용자가 아니라 푸시 발송 대상자 seed로만 사용합니다.
- RSS `guid`는 사용하지 않고, link URL 마지막 path segment에서 `article_id`를 추출합니다.
- 같은 기사가 여러 카테고리에 나타날 수 있어 기사와 카테고리 매핑을 분리했습니다.
- 카테고리 현황은 저장된 전체 기사 수를 보여주고, 목록은 최신순으로 50건씩 가져오며 `더보기`로 전체 기사에 접근합니다. 검색/정렬은 과제 요구 범위를 넘기므로 제외하고 최신순 읽기 흐름에 집중했습니다.
- 뉴스 열람 앱은 기사 메타데이터와 읽음 상태를 관리하고 본문 소비는 원 출처로 연결합니다. 본문 수집/저장은 저작권, 출처 표기, 최신성, 삭제/수정 반영, HTML sanitizing, 이미지/동영상 자산 처리 문제가 생기고, iframe은 언론사 CSP/X-Frame-Options 정책으로 막힐 수 있어 새 탭 방식을 선택했습니다.
- DND 시간대에 해당하는 사용자는 해당 발송에서 제외합니다. 보류 큐는 과제 범위 밖으로 두었습니다.
- APNS/FCM은 실제 외부 연동 없이 `success` 또는 `fail` 결과를 시뮬레이션하고 DB에 저장합니다. 실패 재시도 큐는 과제 범위를 넓히므로 구현하지 않고, 실패도 검증 가능한 이력으로 남깁니다.
- 프론트엔드는 같은 origin `/api` 호출을 기본으로 하며, dev server와 Nginx proxy가 백엔드 연결을 담당합니다.

## 보안과 공개 저장소 기준

- 원본 과제 문서, 원본 사용자 workbook, 제출 안내 원문은 저장소 문서와 코드에 복사하지 않았습니다.
- `.env`, 로컬 runtime DB, 원본 첨부 파일은 커밋 대상에서 제외합니다.
- 공개 산출물에는 실행과 검증에 필요한 DB/CSV/스크린샷만 포함합니다.
- 운영 로그에는 device id 전체값을 남기지 않는 기준으로 구현했습니다.

## AI 활용 고지

OpenAI Codex를 사용해 설계 문서 정리, Spring Boot/React 구현, 테스트 작성, Docker/OCI 배포 파일 작성, QA 자동화와 README 정리에 활용했습니다. Codex는 로컬 저장소의 문서와 코드, 테스트 결과를 바탕으로 변경안을 만들었고, 핵심 변경은 자동 테스트, Docker healthcheck, Playwright, Chrome 직접 QA로 검증했습니다.

## 참고 문서

- [Architecture](new-pulse-docs/02-architecture.md)
- [Backend Design](new-pulse-docs/03-backend-design.md)
- [Frontend Design](new-pulse-docs/04-frontend-design.md)
- [OCI Deployment](new-pulse-docs/05-deployment-oci.md)
- [Security Governance](new-pulse-docs/06-security-governance.md)
- [API Contract](new-pulse-docs/07-api-contract.md)
- [DB Schema](new-pulse-docs/08-db-schema.md)
- [Definition of Done](new-pulse-docs/harness/definition-of-done.md)
