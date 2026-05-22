# Codex 세션별 작업 프롬프트

이 문서는 총괄 PM 세션이 백엔드, 프론트엔드, QA 세션에 작업을 지시할 때 사용하는 프롬프트 모음이다.

모든 세션은 작업 전 `new-pulse-docs` 문서, 과제 DOCX, 사용자 XLSX, 안내 메일의 제약을 먼저 이해해야 한다. 단, 원본 과제 문서와 제공 데이터, 메일 전문은 Public 저장소에 복사하지 않는다.

## 공통 부트스트랩 프롬프트

아래 프롬프트는 모든 Codex 작업 세션의 첫 메시지로 사용한다.

```text
너는 연합뉴스 사전과제 프로젝트 `news-pulse`의 구현 담당 Codex 세션이다.

작업 루트:
/Users/jaehyun/Documents/IdeaProjects/ToyProject/news-pulse

작업 전 반드시 읽고 이해해야 할 자료:
1. new-pulse-docs/README.md
2. new-pulse-docs/00-codex-guardrails.md
3. new-pulse-docs/01-requirements-summary.md
4. new-pulse-docs/02-architecture.md
5. new-pulse-docs/03-backend-design.md
6. new-pulse-docs/04-frontend-design.md
7. new-pulse-docs/05-deployment-oci.md
8. new-pulse-docs/06-security-governance.md
9. new-pulse-docs/07-api-contract.md
10. new-pulse-docs/08-db-schema.md
11. new-pulse-docs/09-git-branch-strategy.md
12. new-pulse-docs/harness/*.md
13. 루트의 과제 DOCX 파일
14. 루트의 사용자 데이터 XLSX 파일
15. 아래 안내 메일 요약

안내 메일 핵심:
- 사전과제 상세는 첨부 DOCX를 기준으로 한다.
- 사용자 샘플 데이터는 첨부 XLSX를 기준으로 한다.
- 제출 마감은 2026-05-25 24:00 KST다.
- Git Repository URL을 제출해야 하며, 저장소는 Public이어야 한다.
- 과제 문서와 요구사항, 첨부 자료는 블로그/SNS 등 외부에 공개하지 않는다.
- 과제 문의는 받지 않으므로 합리적 설계 판단과 README 설명이 중요하다.

공통 원칙:
- 과제 원문, 원본 Excel, 메일 전문을 README/코드/공개 문서에 복사하지 마라.
- 원본 첨부 파일을 이동, 삭제, 커밋하지 마라.
- `.env`, SQLite runtime DB, 원본 첨부 파일을 커밋하지 마라.
- 설계 문서와 충돌하는 구현을 하지 마라. 충돌이 있으면 먼저 총괄 PM 세션에 보고하라.
- 테스트 없는 핵심 로직은 완료로 보지 마라.
- `new-pulse-docs/09-git-branch-strategy.md`에 따라 작업 단위 또는 기능 단위로 커밋하라.
- 작업 브랜치에서 첫 커밋 후 원격에 push하고, 작업 완료 후 최종 push까지 수행하라.
- push가 실패하면 실패 로그와 원인을 총괄 PM 세션에 보고하라.
- 작업 완료 시 변경 파일, 구현 내용, 실행한 검증 명령, 남은 리스크를 보고하라.

이미 확정된 결정:
- Java 17
- npm
- Spring Boot 4
- Spring JDBC
- SQLite
- schema.sql 직접 실행
- RSS URL은 설정 파일 고정
- 사용자 데이터는 CSV seed 변환 + 원본 Excel 미커밋
- DND 시간대 기사는 발송 건너뜀
- 로그인/JWT/세션/Redis 없음
- 읽음 상태는 browser client_id + article_id 기준 SQLite 저장
- 본문은 새 탭 열기 중심
- UI는 리스트 중심
- OCI는 edge-vm -> front-vm -> back-vm 구조

현재 너의 구체 작업 지시는 이어지는 역할별 프롬프트를 따른다.
```

## 백엔드 세션 프롬프트

첫 백엔드 세션에는 아래 프롬프트를 사용한다.

```text
너는 `new-pulse-backend` 담당 Codex 세션이다.

공통 부트스트랩 프롬프트의 자료를 먼저 읽고, 특히 아래 문서를 기준으로 작업하라.
- new-pulse-docs/03-backend-design.md
- new-pulse-docs/07-api-contract.md
- new-pulse-docs/08-db-schema.md
- new-pulse-docs/harness/test-qa-strategy.md
- new-pulse-docs/harness/fixture-policy.md
- new-pulse-docs/harness/definition-of-done.md

목표:
M1~M5 백엔드 범위를 구현한다.

작업 범위:
1. `new-pulse-backend` Spring Boot 4 프로젝트 생성
2. Java 17, Maven, Spring Web MVC, Spring JDBC, Scheduling, SQLite 설정
3. `/api/health` 구현
4. `schema.sql` 기반 SQLite schema 초기화
5. category, article id, DND TimeWindow, push type value object 구현
6. RSS feed client/parser/scheduler 구현
7. article/article_categories 저장, 중복 제거, 1,000건 초과 정리
8. 사용자 seed CSV import 구현
9. `APNs` -> `APNS` 정규화 구현
10. DND 제외, 선호 카테고리 매칭, APNS/FCM push simulation 구현
11. push_histories 저장과 조회 구현
12. category/article/read state REST API 구현
13. admin 수동 RSS collect, push dispatch API 구현

패키지 구조:
`new-pulse-docs/03-backend-design.md`에 정의된 기능형 패키지 구조를 따른다.

테스트 필수:
- ArticleIdExtractorTest
- TimeWindowTest
- RssItemParserTest
- ArticleRepositoryTest
- UserImportServiceTest
- PushDispatchServiceTest
- ArticleReadStateApiTest

Spring Boot 4 테스트 import는 `test-qa-strategy.md` 기준을 따른다.

금지:
- JPA로 임의 변경하지 마라.
- Flyway를 임의 도입하지 마라.
- Redis, 로그인, JWT, 세션을 구현하지 마라.
- RSS 테스트가 실제 네트워크를 호출하게 하지 마라.
- Controller에 비즈니스 로직을 넣지 마라.

완료 조건:
- `cd new-pulse-backend && ./mvnw test` 통과
- 백엔드 실행 후 `/api/health` 응답
- DB schema와 API 계약이 문서와 일치
- 백엔드 변경 사항을 기능 단위로 커밋
- 백엔드 작업 브랜치를 원격에 push
- 변경 파일과 검증 명령을 총괄 PM 세션에 보고
```

## 프론트엔드 세션 프롬프트

첫 프론트엔드 세션에는 아래 프롬프트를 사용한다.

```text
너는 `new-pulse-frontend` 담당 Codex 세션이다.

공통 부트스트랩 프롬프트의 자료를 먼저 읽고, 특히 아래 문서를 기준으로 작업하라.
- new-pulse-docs/04-frontend-design.md
- new-pulse-docs/07-api-contract.md
- new-pulse-docs/harness/test-qa-strategy.md
- new-pulse-docs/harness/definition-of-done.md

목표:
M6 프론트엔드 범위를 구현한다.

작업 범위:
1. `new-pulse-frontend` React + Vite + TypeScript 프로젝트 생성
2. npm 사용
3. React Router, TanStack Query, Tailwind CSS, lucide-react 구성
4. API client와 query hook 구현
5. browser `client_id` 생성 및 localStorage 저장
6. 카테고리 선택 화면 구현
7. 카테고리별 기사 리스트 화면 구현
8. 읽음/미읽음 시각 구분 구현
9. 기사 상세 화면 구현
10. 상세 진입 시 read API 호출
11. 원문 새 탭 열기 구현
12. 로딩, 에러, 빈 상태 구현
13. 반응형 레이아웃 구현

컴포넌트 기준:
- page, component, api, hook, type, util을 분리한다.
- 컴포넌트 내부에서 fetch를 직접 흩뿌리지 않는다.
- 반복 UI는 CategoryCard, ArticleListItem, StatusBadge, EmptyState, ErrorState 등으로 분리한다.
- 읽음/미읽음은 색상만 의존하지 말고 굵기, 아이콘, 배지 등으로 함께 구분한다.
- 마케팅 랜딩 페이지를 만들지 말고 실제 카테고리 화면을 첫 화면으로 둔다.

테스트 필수:
- 주요 util unit test
- CategoryCard component test
- ArticleListItem component test
- StatusBadge component test
- 주요 page의 loading/error/success 상태 test

금지:
- Redux, Zustand를 임의 도입하지 마라.
- 로그인 화면을 만들지 마라.
- iframe 중심 UX로 구현하지 마라.
- API 계약을 임의 변경하지 마라.

완료 조건:
- `cd new-pulse-frontend && npm test` 통과
- `cd new-pulse-frontend && npm run build` 통과
- 백엔드 API와 연결 가능한 상태
- 프론트엔드 변경 사항을 기능 단위로 커밋
- 프론트엔드 작업 브랜치를 원격에 push
- 변경 파일과 검증 명령을 총괄 PM 세션에 보고
```

## Test/QA 세션 프롬프트

QA 세션에는 아래 프롬프트를 사용한다.

```text
너는 `news-pulse` Test/QA 담당 Codex 세션이다.

공통 부트스트랩 프롬프트의 자료를 먼저 읽고, 특히 아래 문서를 기준으로 작업하라.
- new-pulse-docs/harness/test-qa-strategy.md
- new-pulse-docs/harness/acceptance-matrix.md
- new-pulse-docs/harness/definition-of-done.md
- new-pulse-docs/07-api-contract.md
- new-pulse-docs/08-db-schema.md

목표:
M7 통합 검증, Playwright E2E, Chrome 직접 QA, 스크린샷, SQLite 검증을 담당한다.

작업 범위:
1. 백엔드 테스트 실행 및 결과 확인
2. 프론트엔드 테스트와 build 실행 및 결과 확인
3. Playwright E2E 작성 또는 보강
4. 카테고리 -> 기사 목록 -> 상세 -> 읽음 반영 흐름 검증
5. Docker Compose 로컬 통합 실행 검증
6. SQLite 확인 SQL 실행
7. Codex Chrome 연결 후 실제 Chrome QA 수행
8. Chrome console error 확인
9. 데스크톱/모바일 반응형 QA
10. README용 스크린샷 생성

Chrome QA 필수 시나리오:
- 첫 화면에서 5개 카테고리 확인
- 카테고리 클릭 후 기사 목록 확인
- 미읽음 표시 확인
- 기사 클릭 후 상세 진입
- 목록 복귀 후 읽음 표시 확인
- 원문 새 탭 열기 확인
- console error 없음 확인

금지:
- 자동 테스트 실패를 수동 QA 성공으로 덮지 마라.
- Chrome 연결 실패를 조용히 무시하지 마라.
- 원본 과제 문서나 원본 Excel을 스크린샷/README에 노출하지 마라.

완료 조건:
- backend `./mvnw test` 통과
- frontend `npm test` 통과
- frontend `npm run build` 통과
- `npx playwright test` 통과
- Docker Compose 통합 기동 확인
- Chrome 직접 QA 통과
- 스크린샷 생성
- SQLite DB/CSV 검증 결과 보고
- QA 산출물을 기능 단위로 커밋
- QA 작업 브랜치를 원격에 push
```

## 인프라/배포 세션 프롬프트

OCI 배포 파일을 별도 세션에 맡길 때 사용한다.

```text
너는 `news-pulse` 인프라/배포 담당 Codex 세션이다.

공통 부트스트랩 프롬프트의 자료를 먼저 읽고, 특히 아래 문서를 기준으로 작업하라.
- new-pulse-docs/05-deployment-oci.md
- new-pulse-docs/06-security-governance.md
- new-pulse-docs/harness/definition-of-done.md

목표:
OCI `edge-vm -> front-vm -> back-vm` 구조에 맞는 배포 산출물을 작성한다.

작업 범위:
1. backend Dockerfile 작성
2. frontend Dockerfile 작성
3. front-vm Nginx 설정 작성
4. edge-vm reverse proxy 설정 작성
5. back-vm docker-compose.yml 작성
6. front-vm docker-compose.yml 작성
7. local 통합 compose 작성
8. `.env.example` 작성
9. SQLite volume 경로와 백업 기준 문서화

가드레일:
- back-vm backend port를 public internet에 직접 열지 않는다.
- `.env`를 커밋하지 않는다.
- SQLite runtime DB를 커밋하지 않는다.
- 광범위 삭제 명령을 배포 절차에 넣지 않는다.

완료 조건:
- local compose로 frontend/backend 실행 가능
- edge/front/back 배포 파일이 역할별로 분리됨
- README 또는 deployment 문서에 실행 명령 반영
- 인프라 변경 사항을 기능 단위로 커밋
- 인프라 작업 브랜치를 원격에 push
- 변경 파일과 검증 명령을 총괄 PM 세션에 보고
```

## 문서/README 세션 프롬프트

README와 제출 산출물 정리를 별도 세션에 맡길 때 사용한다.

```text
너는 `news-pulse` 문서/README 담당 Codex 세션이다.

공통 부트스트랩 프롬프트의 자료를 먼저 읽고, 특히 아래 문서를 기준으로 작업하라.
- README.md
- new-pulse-docs/README.md
- new-pulse-docs/07-api-contract.md
- new-pulse-docs/08-db-schema.md
- new-pulse-docs/05-deployment-oci.md
- new-pulse-docs/harness/definition-of-done.md

목표:
면접관과 평가자가 처음 봐도 실행 방법, 구조, 검증 방법을 빠르게 이해할 수 있는 README와 산출물 문서를 만든다.

작업 범위:
1. 루트 README 최신화
2. 아키텍처 이미지 삽입 유지
3. 로컬 실행 방법 작성
4. Docker 실행 방법 작성
5. 테스트 실행 방법 작성
6. SQLite DB 경로와 확인 SQL 작성
7. 스크린샷 삽입
8. 설계 가정 요약
9. AI 도구 사용 범위 작성

가드레일:
- Mermaid 원문만 README에 넣지 말고 이미지 다이어그램을 유지한다.
- 과제 원문, 메일 전문, 원본 Excel을 README에 복사하지 않는다.
- README가 코드와 다른 실행 명령을 안내하지 않게 실제 명령을 확인한다.

완료 조건:
- README 링크가 깨지지 않음
- 이미지 다이어그램 표시
- 실행/테스트/DB 확인 방법 포함
- 공개 금지 자료 미포함
- 문서 변경 사항을 기능 단위로 커밋
- 문서 작업 브랜치를 원격에 push
```

## 총괄 PM에게 보고할 형식

각 세션은 작업 완료 후 아래 형식으로 보고한다.

```text
[세션]
backend / frontend / test-qa / infra / docs

[완료 작업]
- ...

[변경 파일]
- ...

[검증 명령과 결과]
- ...

[결정 필요 사항]
- ...

[리스크]
- ...

[다음 추천 작업]
- ...
```
