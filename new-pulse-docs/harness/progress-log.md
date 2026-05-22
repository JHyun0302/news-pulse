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
