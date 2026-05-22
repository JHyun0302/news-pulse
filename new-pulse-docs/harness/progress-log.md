# 진행 로그

총괄 PM 세션이 각 Codex 세션의 완료 보고를 요약해 기록한다.

## 2026-05-21 Backend 세션 완료 보고

세션:

- backend

완료 작업:

- `new-pulse-backend` Spring Boot 4.0.6 / Java 17 / Maven Wrapper 프로젝트 생성
- SQLite `schema.sql` 초기화 구현
- Spring JDBC repository 구현
- RSS 수집, 파싱, 스케줄러 구현
- 사용자 CSV seed import 구현
- push dispatch/history 구현
- article/read state API 구현
- admin API 구현
- health API 구현
- 원본 XLSX는 건드리지 않고 `users.csv` seed로 변환
- 런타임 SQLite DB는 검증 후 제거
- 필수 테스트 7종 포함 총 13개 테스트 작성

주요 변경 영역:

- `new-pulse-backend/pom.xml`
- `new-pulse-backend/mvnw`
- `new-pulse-backend/src/main/resources/application.yml`
- `new-pulse-backend/src/main/resources/schema.sql`
- `new-pulse-backend/src/main/resources/seed/users.csv`
- `new-pulse-backend/src/main/java/com/newpulse/**`
- `new-pulse-backend/src/test/java/com/newpulse/**`
- `new-pulse-backend/src/test/resources/**`

검증 결과:

```bash
cd new-pulse-backend && ./mvnw test
# 성공: Tests run 13, Failures 0, Errors 0

./mvnw -q -DskipTests package
# 성공

java -jar target/new-pulse-backend-0.0.1-SNAPSHOT.jar --server.port=18081 --news-pulse.rss.scheduler.enabled=false
# /api/health 응답: status UP, database UP
```

추가 확인:

- 설정된 YNA RSS 5개 URL 모두 HTTP 200 `application/xml` 확인
- Maven compiler release는 17로 고정

남은 리스크:

- 실제 RSS 수집 후 SQLite/CSV 검증 산출물 생성은 M7 QA 단계에서 수행 필요
- 로컬 검증 Java runtime은 Java 25였으나 빌드 타깃은 Java 17

PM 인수인계:

- frontend 세션은 백엔드가 구현한 실제 API shape를 먼저 확인하고 `07-api-contract.md`와 차이가 있으면 총괄 PM에 보고한다.
- test-qa 세션은 M7에서 실제 RSS 수집, push dispatch, SQLite/CSV 산출물 생성을 담당한다.
- Git 초기화 전 `.idea`, `target`, `.DS_Store`, 원본 첨부 파일이 커밋되지 않도록 확인한다.

## 2026-05-21 Frontend 세션 완료 보고

세션:

- frontend

완료 작업:

- `new-pulse-frontend` React 19 / Vite 8 / TypeScript / npm 프로젝트 구성
- React Router, TanStack Query, Tailwind CSS 4.3, lucide-react 연결
- API client/query hook 구현
- `news-pulse-client-id` localStorage 관리 구현
- 카테고리, 기사 목록, 기사 상세 화면 구현
- 상세 진입 시 읽음 API 호출
- 목록 복귀 시 읽음/미읽음이 배지, 아이콘, 굵기, 대비로 구분되도록 구현
- loading/error/empty 상태 구현
- component/page/util 테스트 추가

주요 변경 영역:

- `new-pulse-frontend/package.json`
- `new-pulse-frontend/package-lock.json`
- `new-pulse-frontend/vite.config.ts`
- `new-pulse-frontend/src/api/**`
- `new-pulse-frontend/src/hooks/**`
- `new-pulse-frontend/src/pages/**`
- `new-pulse-frontend/src/components/**`
- `new-pulse-frontend/src/utils/**`
- `new-pulse-frontend/src/types/**`

검증 결과:

```bash
cd new-pulse-frontend && npm install
# 성공, 취약점 0건

npm test
# 성공: 8 files / 16 tests passed

npm run build
# 성공
```

추가 확인:

- 임시 mock API로 카테고리 -> 목록 -> 상세 -> 읽음 반영 흐름 확인
- browser console error 0건

남은 리스크:

- 실제 백엔드와 연결한 통합 QA가 아직 필요
- API 계약 문서와 실제 backend controller 응답 shape가 일치하는지 M7에서 확인 필요

PM 인수인계:

- 다음 backend 작업은 CORS/dev proxy, CSV export, deliverables 생성 API 또는 script 검토가 우선이다.
- 다음 frontend 작업은 실제 backend dev server와 연결해 proxy/env 설정을 검증하고, API shape mismatch가 있으면 총괄 PM에 보고한다.
- Test/QA 세션은 backend+frontend 실제 통합 실행 후 Playwright와 Chrome QA를 수행한다.

## 2026-05-22 Backend readiness 재검증

세션:

- backend

완료 작업:

- API 응답 shape와 `07-api-contract.md` 일치 확인
- 백엔드 README, export script, deliverables README, API error handler, API contract test readiness 확인
- 수동 RSS collect, push dispatch, push history 조회, CSV export 방식 검증
- frontend dev proxy 기준으로 CORS 불필요함 확인

검증 결과:

```bash
cd new-pulse-backend
./mvnw test
# 성공: 16 tests

./mvnw -q -DskipTests package
# 성공

# local jar 실행 후 /api/health
# status=UP, database=UP
```

운영 검증:

- RSS collect: 5 feeds, 신규 472건, 중복 90건, 실패 0건
- push dispatch: target 20814건, success 10331건, fail 10483건, DND skip 9056건, duplicate skip 3812건
- `/api/admin/push-histories?limit=3` 계약 필드 확인
- CSV export 생성 확인: `articles.csv`, `article_categories.csv`, `push_histories.csv`, `export-summary.csv`

Export 명령:

```bash
cd new-pulse-backend
python3 scripts/export_deliverables.py --db news-pulse.sqlite --out deliverables
```

PM 판단:

- 백엔드는 기능 추가 없이 QA 결함 대응 모드로 전환한다.
- SQLite 복사본은 기본 export에 포함하지 않는다.
- DB 복사본이 필요하면 `--include-db-copy`를 사용하되 공개 저장소 커밋 전 PM 검토가 필요하다.

## 2026-05-22 Frontend readiness 재검증

세션:

- frontend

완료 작업:

- 실제 backend 연결 기준 재검증
- `/api/health`, `/api/categories`, `/api/admin/rss/collect`, `/api/articles?category=POLITICS` 응답 확인
- 브라우저 실제 흐름 확인: 카테고리 -> 정치 목록 -> 상세 -> 목록 복귀
- 상세 진입 후 읽음 처리와 SQLite 반영 확인
- Vite proxy/env 설정 확인
- backend controller 응답 shape와 frontend TypeScript type mismatch 없음 확인

검증 결과:

```bash
cd new-pulse-frontend
npm test
# 성공: 8 files / 16 tests

npm run build
# 성공

cd ../new-pulse-backend
./mvnw test
# 성공: 16 tests

curl http://localhost:5173/api/health
# Vite proxy 경유 성공
```

통합 확인:

- `GET http://localhost:8080/api/health`: `UP`
- 빈 DB 상태 `GET /api/categories`: 5개 카테고리, count 0 정상
- `POST /api/admin/rss/collect`: 신규 472건, 중복 90건, 실패 0건
- browser console error 0건

PM 판단:

- 프론트엔드는 기능 추가 없이 QA 결함 대응 모드로 전환한다.
- QA 세션은 `http://localhost:8080`, `http://localhost:5173/` 기준으로 통합 검증을 수행한다.
- 실제 backend 응답과 frontend type mismatch는 현재 없음.

## 2026-05-22 Backend/Frontend 결함 대응 모드 확인

세션:

- backend
- frontend

완료 작업:

- backend 세션은 QA 결함 대응 모드 전환을 확인
- frontend 세션은 QA 결함 대응 모드 전환을 확인
- 두 세션 모두 새 결함이 전달되지 않아 임의 코드 변경, 테스트 실행, 커밋, push를 수행하지 않음

운영 기준:

- 신규 기능 개발은 중단하고 QA 세션에서 보고되는 결함만 처리한다.
- 결함 수정 전 재현 테스트를 먼저 추가한다.
- API 계약과 응답 shape는 임의 변경하지 않는다.
- 수정 발생 시 각 세션은 한글 Conventional Commit 메시지로 기능 단위 커밋 후 push한다.

PM 판단:

- 다음 작업은 M7 Test/QA 세션 시작이다.
- Backend/Frontend 세션은 대기 상태로 두고, QA 결과에 따라 결함 수정 지시를 내린다.

## 2026-05-22 M7 QA 재실행 결과

세션:

- test-qa

검증 결과:

- Backend `./mvnw test`: 통과, 16 tests
- Frontend `npm test`: 통과, 16 tests
- Frontend `npm run build`: 통과
- Frontend `npx playwright test`: 통과, 2 tests
- Backend/Frontend 동시 실행 정상: `localhost:8080`, `localhost:5173`
- `/api/health`: backend 8080, frontend proxy 5173 모두 `UP`
- RSS collect: feed 5, 신규 456, 중복 106, 실패 0
- push dispatch: target 21617, success 10814, fail 10803, DND skip 7492, duplicate skip 4573
- Chrome 직접 QA 통과: 5개 카테고리, 목록, 미읽음, 상세, 원문 새 탭, 읽음 반영 확인
- Chrome console error 0건
- 모바일 QA: Playwright mobile viewport 기준 텍스트/버튼 겹침 없음
- 원본 과제 문서, 원본 사용자 데이터, 제출 안내 원문 노출 없음 확인

SQLite counts:

```text
articles: 456
article_categories: 562
users: 100
user_preferences: 300
push_histories: 21617
article_read_states: 5
duplicate push pairs: 0
integrity_check: ok
```

산출물:

- `new-pulse-backend/deliverables/*.csv`
- `new-pulse-backend/deliverables/news-pulse-qa.sqlite`
- `screenshots/*.png`

커밋:

- `c2be42f test: QA 산출물과 스크린샷 갱신`

남은 결함:

- Frontend/Docker 배포 결함 1건
- `docker-compose.local.yml` 기동은 빌드/시작까지 완료됐지만 frontend 컨테이너 healthcheck가 `localhost/healthz`에서 실패해 `unhealthy`
- 외부 `http://localhost:3000/healthz`와 컨테이너 내부 `http://127.0.0.1/healthz`는 `ok`
- 컨테이너 내부 `http://localhost/healthz`만 connection refused

PM 판단:

- Backend 결함은 없다. backend 세션은 계속 대기한다.
- Playwright config 결함은 재발하지 않았다.
- 다음 작업은 frontend/infra healthcheck 주소를 `localhost`에서 `127.0.0.1`로 수정하는 것이다.
- 수정 후 Docker local compose healthcheck만 부분 재검증하고, 전체 QA green 상태를 확정한다.

## 2026-05-22 Infra healthcheck 수정과 부분 QA

세션:

- infra
- test-qa

완료 작업:

- frontend Docker healthcheck URL을 `localhost`에서 `127.0.0.1`로 변경
- local compose, frontend Dockerfile, front-vm compose healthcheck 기준 통일
- nginx.conf와 API proxy 동작은 변경하지 않음
- 앱 코드, API client, 화면 코드는 변경하지 않음

커밋:

- `526cf60 fix: 프론트 컨테이너 헬스체크 주소 수정`

부분 QA 결과:

```bash
docker compose -f docker-compose.local.yml up -d --build
# 성공
```

- frontend container: `healthy`
- backend container: `healthy`
- `http://localhost:3000/healthz`: `200 OK`, body `ok`
- `http://localhost:3000/api/health`: `200`, `{"status":"UP","database":"UP",...}`
- `http://localhost:8080/api/health`: `UP`
- 첫 화면 `http://localhost:3000/`: `200 OK`, `News Pulse` HTML 응답 확인
- 추가 결함 없음
- working tree clean

QA 판단:

- 수정 영향이 Docker healthcheck/proxy 범위로 한정되어 Playwright/Chrome 전체 재검증은 생략
- Docker local compose 기준 완료 조건 충족

PM 판단:

- M7 QA는 green 상태로 판단한다.
- 다음 작업은 README/문서 최종화, 제출용 산출물 확인, main 병합 준비다.

## 2026-05-22 제출용 README 최종화와 최종 QA

세션:

- docs
- test-qa

Docs 완료 작업:

- 루트 `README.md`를 제출용 문서로 최종 정리
- 프로젝트 개요, 기술 스택, 아키텍처 이미지, 실행 방법, 테스트/QA 명령, 주요 API, DB/산출물, 스크린샷, AI 활용 고지 반영
- 로그인 없음, `client_id` 기반 읽음 상태, SQLite, DND skip, same-origin `/api` 등 주요 설계 판단 정리
- 원본 과제 문서, 원본 사용자 데이터, 제출 안내 원문, 개인 제출 자료 내용 노출 없음 확인

Docs 검증:

```bash
git diff --check
# 통과
```

- README 로컬 링크/이미지 경로 검사 통과
- `git status --short --branch`: clean

커밋:

- `a3c3cc2 docs: 제출용 README 최종 정리`

최종 QA 결과:

- 최신 브랜치 pull 결과: `Already up to date`
- HEAD: `a3c3cc2 docs: 제출용 README 최종 정리`
- `git status --short --branch`: clean
- Backend `./mvnw test`: 통과, 16 tests
- Backend `./mvnw -q -DskipTests package`: 통과
- Frontend `npm test`: 통과, 16 tests
- Frontend `npm run build`: 통과
- Frontend `npx playwright test`: 통과, 2 tests
- Playwright 선행 데이터용 RSS collect: feed 5, 신규 460, 실패 0

Docker QA:

- `docker compose -f docker-compose.local.yml up -d --build`: 성공
- `news-pulse-backend-local`: `healthy`
- `news-pulse-frontend-local`: `healthy`
- `http://localhost:3000/healthz`: `ok`
- `http://localhost:3000/api/health`: `UP`
- `http://localhost:8080/api/health`: `UP`
- `http://localhost:3000/`: `200 OK`

Browser QA:

- Playwright E2E: 카테고리, 목록, 상세, 읽음 반영, 모바일 viewport 통과
- Chrome 직접 QA: 카테고리 -> 목록 -> 상세 -> 원문 새 탭 -> 목록 복귀 읽음 반영 통과
- Chrome console error: 0건
- Chrome wrapper locator에서 일시적 CDP timeout이 있었으나 실제 브라우저 좌표 클릭으로 원문 새 탭/복귀 흐름 보완 검증
- 앱 결함은 재현되지 않음

README/노출 점검:

- README 실행 명령, 산출물 경로, 스크린샷 링크가 실제 파일과 일치
- README QA count는 `new-pulse-backend/deliverables/table-counts.csv`와 일치
- tracked 파일에 원본 `.docx`, `.xlsx`, `.env`, runtime `news-pulse.sqlite` 없음
- 원본 과제 문서, 원본 사용자 데이터, 제출 안내 원문 노출 없음
- `new-pulse-docs/harness/codex-session-prompts.md`에는 작업용 제출 안내 문구가 남아 있어 공개 저장소 기준을 보수적으로 잡으면 PM 확인 대상

PM 판단:

- 기능, 통합, Docker, Playwright, Chrome QA 기준 제출 가능한 green 상태다.
- 다음 작업은 공개 저장소 문서 수위 최종 점검, UI 개선 여부 결정, `main` 병합 준비다.

## 2026-05-23 UI polish 이후 최종 QA

세션:

- frontend
- test-qa

전제:

- frontend UI polish 커밋 `0d6dc16 style: 뉴스 서비스형 UI 정리` 이후 최신 `feature/m1-m8-implementation` 기준 검증
- QA 기준 URL은 Docker compose `http://localhost:3000`

브랜치 확인:

- `git pull origin feature/m1-m8-implementation`: `Already up to date`
- `git status --short --branch`: `feature/m1-m8-implementation...origin/feature/m1-m8-implementation`

자동 테스트:

- Backend `./mvnw test`: 통과, 16 tests
- Backend `./mvnw -q -DskipTests package`: 통과
- Frontend `npm test`: 통과, 16 tests
- Frontend `npm run build`: 통과
- Frontend `npx playwright test`: 통과, 2 tests
- RSS collect 이후 README용 기본 스크린샷 동기화를 위해 Playwright를 재실행했고 2 tests 모두 통과

Docker local QA:

```bash
docker compose -f docker-compose.local.yml -p news-pulse up -d --build
# 성공
```

- `news-pulse-frontend-local`: `healthy`
- `news-pulse-backend-local`: `healthy`
- `http://localhost:3000/healthz`: `ok`
- `http://localhost:3000/api/health`: `UP`
- `http://localhost:8080/api/health`: `UP`
- `http://localhost:3000/`: `200 OK`

데이터 검증:

- RSS collect: feed 5, 신규 3, duplicate skip 557, failed feed 0
- Push dispatch: target 19,815, success 9,794, fail 10,021, DND skip 9,448, duplicate skip 4,297
- SQLite `PRAGMA integrity_check`: `ok`
- SQLite count:
  - `articles`: 463
  - `article_categories`: 565
  - `users`: 100
  - `user_preferences`: 300
  - `push_histories`: 19,815
  - `article_read_states`: 25
  - duplicate push pair: 0
- Push history status count:
  - `success`: 9,794
  - `fail`: 10,021
- Category count:
  - `POLITICS`: 123
  - `NORTH_KOREA`: 80
  - `ECONOMY`: 120
  - `INDUSTRY`: 120
  - `SOCIETY`: 122
- CSV export 검증: `/tmp/news-pulse-ui-polish-export`에 `articles.csv`, `article_categories.csv`, `push_histories.csv`, `export-summary.csv`, `news-pulse-qa.sqlite` 생성 성공
- 저장소의 기존 제출용 CSV/DB deliverable은 UI polish 영향 범위가 아니므로 덮어쓰지 않음

Browser QA:

- Playwright E2E: 카테고리 -> 목록 -> 상세 -> 읽음 반영 통과
- Playwright mobile viewport: 가로 넘침/텍스트 겹침 없음
- Chrome 직접 QA: `http://localhost:3000` 기준 카테고리 5개, 목록 row UI, 미읽음 표시, 상세 진입, `연합뉴스 원문 보기` 새 탭, 목록 복귀 후 읽음 반영 통과
- Chrome console error: 0건

스크린샷:

- README용 스크린샷 최신화:
  - `screenshots/category-overview.png`
  - `screenshots/article-list-read-state.png`
  - `screenshots/article-detail.png`
  - `screenshots/mobile-category-overview.png`
  - `screenshots/mobile-article-list.png`
  - `screenshots/mobile-article-detail.png`
- Chrome 직접 QA 보조 스크린샷 최신화:
  - `screenshots/chrome-category-overview.png`
  - `screenshots/chrome-article-detail.png`
  - `screenshots/chrome-article-list-read-state.png`

노출/문서 점검:

- README의 스크린샷 링크가 실제 파일과 일치
- tracked 파일 기준 원본 `.docx`, `.xlsx`, `.env`, runtime `news-pulse.sqlite` 없음
- 스크린샷에 원본 과제 문서, 원본 사용자 데이터, 제출 안내 원문 노출 없음

결함 판단:

- API contract, 읽음 처리, 원문 새 탭 열기, Docker proxy 회귀 없음
- backend 결함 없음
- frontend 결함 없음
- 문서 결함 없음

## 2026-05-23 제출 검증 문서 최종 보강

세션:

- docs

완료 작업:

- 최신 `feature/m1-m8-implementation` 브랜치 기준 문서 보강
- 루트 `README.md`의 DB/산출물 섹션에 평가용 SQLite DB 경로 `new-pulse-backend/deliverables/news-pulse-qa.sqlite` 명시
- CSV 산출물 경로 `new-pulse-backend/deliverables/`와 `sqlite3` 확인 SQL 위치 명확화
- README QA count가 `new-pulse-backend/deliverables/table-counts.csv`와 일치함 확인
- UI polish 이후 상세 화면 버튼 문구 `연합뉴스 원문 보기`를 README QA 설명에 반영
- `new-pulse-backend/deliverables/README.md`를 현재 제출 상태에 맞춰 `news-pulse-qa.sqlite` 포함 산출물 안내로 수정
- `new-pulse-docs/harness/codex-session-prompts.md`의 작업용 제출 안내 문구를 추상화하고 공개 저장소 가드레일만 유지

검증 결과:

```bash
git pull origin feature/m1-m8-implementation
# Already up to date.

git status --short --branch
# ## feature/m1-m8-implementation...origin/feature/m1-m8-implementation

git diff --check
# 통과
```

- README 이미지 링크가 모두 실제 파일과 일치
- README QA count가 `table-counts.csv`와 일치
- `rg` 기준 제출 일정, 상세 안내 원문처럼 보일 수 있는 문구, 불필요한 개인정보성 문구 매칭 없음

남은 리스크:

- 문서 보강 범위라 backend/frontend/Docker 테스트는 재실행하지 않음

## 2026-05-23 뉴스 포털형 UI 이후 최종 QA

세션:

- frontend
- test-qa

전제:

- 뉴스 포털형 UI 커밋 `9a8575c style: 뉴스 포털형 정보 구조 정리` 이후 최신 `feature/m1-m8-implementation` 기준 검증
- QA 기준 URL은 Docker compose `http://localhost:3000`

브랜치 확인:

- `git pull origin feature/m1-m8-implementation`: `Already up to date`
- `git status --short --branch`: `feature/m1-m8-implementation...origin/feature/m1-m8-implementation`

자동 테스트:

- Backend `./mvnw test`: 통과, 16 tests
- Backend `./mvnw -q -DskipTests package`: 통과
- Frontend `npm test`: 통과, 18 tests
- Frontend `npm run build`: 통과
- Frontend `npx playwright test`: 통과, 2 tests
- Playwright 모바일 검증은 390px viewport 기준으로 가로 넘침 없음 확인

Docker local QA:

```bash
docker compose -f docker-compose.local.yml -p news-pulse up -d --build
# 성공
```

- `news-pulse-frontend-local`: `healthy`
- `news-pulse-backend-local`: `healthy`
- `http://localhost:3000/healthz`: `ok`
- `http://localhost:3000/api/health`: `UP`
- `http://localhost:8080/api/health`: `UP`
- `http://localhost:3000/`: `200 OK`

데이터 검증:

- 기존 Docker DB에 기사와 push 이력이 충분하여 추가 RSS collect/dispatch는 실행하지 않음
- SQLite `PRAGMA integrity_check`: `ok`
- SQLite count:
  - `articles`: 463
  - `article_categories`: 565
  - `users`: 100
  - `user_preferences`: 300
  - `push_histories`: 19,960
  - `article_read_states`: 40
  - duplicate push pair: 0
- Push history status count:
  - `success`: 9,876
  - `fail`: 10,084
- Category count:
  - `POLITICS`: 123
  - `NORTH_KOREA`: 80
  - `ECONOMY`: 120
  - `INDUSTRY`: 120
  - `SOCIETY`: 122
- 기존 제출용 산출물 count와 runtime DB count가 달라져 CSV/DB 산출물 갱신:
  - `new-pulse-backend/deliverables/news-pulse-qa.sqlite`
  - `new-pulse-backend/deliverables/articles.csv`
  - `new-pulse-backend/deliverables/article_categories.csv`
  - `new-pulse-backend/deliverables/push_histories.csv`
  - `new-pulse-backend/deliverables/push-histories.csv`
  - `new-pulse-backend/deliverables/table-counts.csv`
  - `new-pulse-backend/deliverables/article-category-counts.csv`
  - `new-pulse-backend/deliverables/push-history-status-counts.csv`
  - `new-pulse-backend/deliverables/article_read_states.csv`
  - `new-pulse-backend/deliverables/export-summary.csv`
- 루트 `README.md`의 현재 QA 산출물 요약 count를 `table-counts.csv`와 일치하도록 갱신

Browser QA:

- Chrome 직접 QA: `http://localhost:3000` 기준 상단 카테고리 nav, 5개 카테고리 현황, 정치 최신뉴스 목록, 미읽음 표시, 상세 진입, `연합뉴스 원문 보기` 새 탭, 목록 복귀 후 읽음 반영 통과
- Chrome console error: 0건
- Playwright 390px 모바일 화면: 가로 넘침/겹침 없음
- API contract, 읽음 처리, 원문 새 탭, Docker proxy 회귀 없음

스크린샷:

- README용 스크린샷 최신화:
  - `screenshots/category-overview.png`
  - `screenshots/article-list-read-state.png`
  - `screenshots/article-detail.png`
  - `screenshots/mobile-category-overview.png`
  - `screenshots/mobile-article-list.png`
  - `screenshots/mobile-article-detail.png`
- Chrome 직접 QA 보조 스크린샷 최신화:
  - `screenshots/chrome-category-overview.png`
  - `screenshots/chrome-article-detail.png`
  - `screenshots/chrome-article-list-read-state.png`

노출 점검:

- README 스크린샷 링크가 실제 파일과 일치
- tracked 파일 기준 원본 `.docx`, `.xlsx`, `.env`, runtime `news-pulse.sqlite` 없음
- 스크린샷에 원본 과제 문서, 원본 사용자 데이터, 제출 안내 원문 노출 없음

결함 판단:

- backend 결함 없음
- frontend 결함 없음
- 문서 결함 없음
