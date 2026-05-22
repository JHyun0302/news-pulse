# Definition of Done

각 마일스톤은 코드 작성만으로 완료하지 않는다. 테스트, 문서, QA 기준을 함께 만족해야 한다.

## 공통 완료 조건

- 관련 설계 문서가 최신 상태다.
- 핵심 로직 테스트가 존재한다.
- 로컬 실행 명령이 실패하지 않는다.
- 공개 금지 자료가 코드와 문서에 포함되지 않았다.
- 변경 파일과 검증 명령을 작업 결과에 남긴다.
- 작업 브랜치가 `09-git-branch-strategy.md`의 규칙을 따른다.

## M1. 프로젝트 골격

- backend `./mvnw test` 성공
- frontend `npm test` 또는 초기 test script 성공
- backend `/api/health` 동작
- frontend 기본 화면 동작
- 루트 README에 이미지 아키텍처 다이어그램이 표시됨

## M2. 백엔드 도메인 기반

- `ArticleIdExtractorTest` 통과
- `TimeWindowTest` 통과
- SQLite schema 초기화 테스트 통과
- value object가 문자열 검증을 캡슐화

## M3. RSS 수집

- RSS parser fixture 테스트 통과
- 수동 수집 API 동작
- 중복 article id 저장 방지
- 1,000건 초과 정리 테스트 통과
- 일부 feed 실패가 전체 수집 실패로 번지지 않음

## M4. 사용자 적재와 푸시 발송

- 사용자 seed 적재 테스트 통과
- `APNs` -> `APNS` 정규화 테스트 통과
- DND 제외 테스트 통과
- APNS/FCM 분기 테스트 통과
- push history success/fail 저장 검증
- 같은 user/article 중복 발송 방지

## M5. 기사 열람 API

- 카테고리 목록 API 테스트 통과
- 기사 목록/detail API 테스트 통과
- 읽음 처리 API 테스트 통과
- `client_id + article_id` 기준 read flag 반영

## M6. 프론트엔드

- 컴포넌트 테스트 통과
- `npm run build` 성공
- 카테고리 -> 목록 -> 상세 흐름 구현
- 읽음/미읽음 구분이 색상만 의존하지 않음
- 로딩/에러/빈 상태 구현

## M7. 통합 검증과 Chrome QA

- backend `./mvnw test` 통과
- frontend `npm test` 통과
- `npx playwright test` 통과
- Docker Compose 로컬 기동 확인
- Codex Chrome 직접 QA 통과
- Chrome console error 없음
- 주요 화면 스크린샷 생성

## M8. OCI 배포

- edge-vm -> front-vm -> back-vm proxy 흐름 확인
- edge-vm public 80/443 접근 확인
- back-vm backend port가 public에 직접 노출되지 않음
- back-vm SQLite volume persistence 확인
- `/api/health` 외부 접근 확인
- backend 로그에 DB lock, permission denied, RSS 반복 실패 없음
