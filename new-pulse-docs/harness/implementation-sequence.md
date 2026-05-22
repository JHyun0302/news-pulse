# 구현 순서

상위 작업 단위와 선택 게이트는 `harness/milestone-roadmap.md`, `harness/decision-gates.md`를 기준으로 한다. 이 파일은 실제 구현 순서와 완료 기준만 압축해서 기록한다.

## 0단계: 프로젝트 골격

완료 기준:

- `new-pulse-backend` Spring Boot 프로젝트 생성
- `new-pulse-frontend` React/Vite 프로젝트 생성
- 루트 README 초안 작성
- Docker Compose 초안 작성

## 1단계: 백엔드 기반

완료 기준:

- SQLite 연결
- schema.sql 초기화
- category enum
- article_id extractor 테스트 통과
- DND time window 테스트 통과

## 2단계: RSS 수집

완료 기준:

- RSS feed URL 설정
- RSS item 파싱
- article, article_categories 저장
- 중복 제거
- 1,000건 초과 정리
- 수동 수집 API 동작

## 3단계: 사용자 적재와 푸시 발송

완료 기준:

- Excel importer 또는 seed importer 구현
- `APNs` 입력값을 `APNS`로 정규화
- 사용자 선호 카테고리 매칭
- DND 제외
- APNS/FCM 시뮬레이션 호출
- push_histories 저장
- CSV export 명령 또는 스크립트 제공

## 4단계: 기사 열람 API

완료 기준:

- 카테고리 목록 API
- 카테고리별 기사 목록 API
- 기사 상세 API
- 읽음 처리 API
- clientId 기준 read flag 반영

## 5단계: 프론트엔드

완료 기준:

- 카테고리 선택 화면
- 기사 리스트 화면
- 읽음/미읽음 시각 구분
- 기사 상세 화면
- 원문 새 탭 열기
- 에러/빈 상태 처리

## 6단계: 검증 산출물

완료 기준:

- 백엔드 테스트 통과
- 프론트 빌드 통과
- Playwright E2E와 스크린샷 생성
- Codex Chrome 연결 QA 수행
- Docker Compose 실행 확인
- SQLite DB와 CSV export 생성
- README에 실행 방법, DB 확인 SQL, 설계 가정 포함
