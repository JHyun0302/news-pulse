# 마일스톤 로드맵

이 문서는 전체 작업을 개발자가 추적 가능한 마일스톤으로 나눈다. 각 마일스톤은 산출물, 완료 조건, 선택 게이트를 가진다.

## M0. 프로젝트 기준 확정

목표:

- 기술 스택, 디렉터리 경계, 보안 가드레일, 테스트 전략 확정

산출물:

- 설계 문서
- 마일스톤/선택 게이트 문서
- 테스트·QA 전략 문서
- Git 브랜치 전략 문서
- README용 아키텍처 이미지 자산

완료 조건:

- 사용자 선택이 필요한 항목을 `decision-gates.md`에 정리
- 구현 전 기본 가드레일 합의
- 브랜치 전략과 README 이미지 다이어그램 기준 확정

선택 게이트:

- D1, D2, D3, D4

## M1. 프로젝트 골격 생성

목표:

- 백엔드와 프론트엔드 프로젝트를 실행 가능한 빈 앱 상태로 만든다.

산출물:

- `new-pulse-backend` Spring Boot 프로젝트
- `new-pulse-frontend` React/Vite 프로젝트
- 루트 `docker-compose.yml` 초안
- 루트 README 초안

완료 조건:

- backend health API 실행
- frontend dev server 실행
- backend/frontend 기본 테스트 명령 성공

선택 게이트:

- D5, D6

## M2. 백엔드 도메인 기반

목표:

- SQLite schema, 핵심 value object, repository 기반을 구현한다.

산출물:

- schema.sql
- category, article id, push type, DND time window 모델
- repository 테스트

완료 조건:

- article id 추출 테스트 통과
- DND 일반/자정 넘김/미설정 테스트 통과
- SQLite schema 초기화 테스트 통과

선택 게이트:

- D7

## M3. RSS 수집

목표:

- 5개 카테고리 RSS를 수집하고 기사 저장 정책을 구현한다.

산출물:

- RSS feed client/parser
- 수동 수집 admin API
- 10분 스케줄러
- article/article_categories 저장

완료 조건:

- feed 일부 실패 시에도 성공 feed 저장
- article_id 기준 중복 제거
- 1,000건 초과 시 오래된 기사 정리

선택 게이트:

- D8

## M4. 사용자 적재와 푸시 발송

목표:

- 사용자 선호 카테고리와 DND 기준으로 발송 대상을 선별하고 이력을 저장한다.

산출물:

- user importer
- push dispatch service
- APNS/FCM simulation service
- push_histories 저장과 조회

완료 조건:

- 사용자 100명 적재 검증
- `APNs` 입력값을 `APNS`로 정규화
- 같은 user/article 중복 발송 방지
- success/fail 이력 저장

선택 게이트:

- D9, D10

## M5. 기사 열람 API

목표:

- 프론트엔드가 사용할 카테고리, 기사 목록, 상세, 읽음 처리 API를 완성한다.

산출물:

- categories API
- articles list/detail API
- read state API

완료 조건:

- clientId 기준 read flag 반영
- 상세 진입 후 읽음 처리
- API 통합 테스트 통과

선택 게이트:

- D11

## M6. 프론트엔드 구현

목표:

- 과제 요구 화면을 컴포넌트 단위로 구현한다.

산출물:

- Category overview page
- Article list page
- Article detail page
- API client/query hooks
- 공통 UI 컴포넌트

완료 조건:

- 카테고리 -> 목록 -> 상세 흐름 동작
- 읽음/미읽음이 색상 외 요소로도 구분
- 로딩/에러/빈 상태 구현
- unit test와 build 통과

선택 게이트:

- D12, D13

## M7. 통합 검증과 Chrome QA

목표:

- 자동 테스트, Docker Compose, 실제 Chrome 브라우저 QA까지 완료한다.

산출물:

- Playwright E2E
- Chrome 직접 QA 기록
- 스크린샷
- SQLite DB/CSV 검증 산출물

완료 조건:

- backend test 통과
- frontend test/build 통과
- Playwright E2E 통과
- Codex Chrome 연결 후 직접 시나리오 검증
- 주요 화면 screenshot 생성
- Chrome console error 없음

선택 게이트:

- D14

## M8. OCI 배포 점검

목표:

- OCI Docker 배포 절차를 검증한다.

산출물:

- production compose
- Nginx frontend image
- backend image
- deployment checklist

완료 조건:

- news-pulse compose 기동
- `/api/health`와 프론트 화면 접근 확인
- SQLite volume persistence 확인

선택 게이트:

- D15
