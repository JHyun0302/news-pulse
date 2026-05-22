# 하네스 검증 매트릭스

이 문서는 구현 중 AI와 사람이 같은 기준으로 결과를 확인하기 위한 체크리스트다.

| 영역 | 검증 대상 | 자동화 방법 | 완료 기준 |
| --- | --- | --- | --- |
| RSS | 피드 수집 | 백엔드 통합 테스트, 수동 admin API | 5개 카테고리에서 기사 저장 |
| RSS | 중복 제거 | Repository 테스트 | 같은 article_id 재수집 시 1건 유지 |
| RSS | 저장 한도 | Repository 테스트 | 1,000건 초과 시 오래된 기사 제거 |
| 사용자 | Excel 데이터 적재 | Importer 테스트 | 100명, preference 정상 적재 |
| 시간 | DND 파싱 | TimeWindow unit test | 일반 구간과 자정 넘김 모두 통과 |
| 푸시 | APNS/FCM 분기 | Dispatch service test | push_type 정규화 후 맞는 메서드 호출 |
| 푸시 | 발송 이력 | DB integration test | success/fail 결과 저장 |
| 푸시 | 중복 발송 방지 | Dispatch service test | 같은 user/article 조합 중복 없음 |
| 읽음 | 기사 클릭 처리 | API test, Playwright | 클릭 후 목록에서 읽음 표시 |
| UI | 카테고리 화면 | Playwright screenshot | 5개 카테고리와 count 표시 |
| UI | 리스트 화면 | Playwright screenshot | 읽음/미읽음 구분 명확 |
| UI | 본문 화면 | Playwright screenshot | 원문 새 탭 링크와 메타데이터 표시 |
| QA | Chrome 직접 점검 | Codex Chrome 연결 후 수동 시나리오 | 실제 Chrome에서 카테고리 -> 목록 -> 상세 -> 원문 열기 확인 |
| QA | 콘솔 오류 | Chrome dev logs | 주요 흐름에서 console error 없음 |
| QA | 반응형 화면 | Chrome viewport 변경 또는 Playwright | 데스크톱/모바일에서 겹침 없음 |
| 문서 | README | 수동 리뷰 | 실행, DB 확인, 스크린샷, 설계 가정 포함 |
| 배포 | Docker Compose | OCI 또는 로컬 compose | frontend/backend 정상 기동 |

## AI 작업 하네스

AI에게 코드 생성을 맡길 때는 아래 순서로 고정한다.

1. 현재 설계 문서와 작업 범위를 먼저 읽게 한다.
2. 한 번에 하나의 모듈만 구현시킨다.
3. 변경 파일과 검증 명령을 반드시 보고하게 한다.
4. 테스트가 없으면 기능 완료로 보지 않는다.
5. 과제 원문과 제공 데이터를 공개 문서에 복사하지 못하게 한다.

## PR 전 로컬 명령

```bash
cd new-pulse-backend
./mvnw test

cd ../new-pulse-frontend
npm test
npm run build
npx playwright test
```

최종 시연 전에는 Docker Compose 기준으로 다시 확인한다.

```bash
docker compose up --build
```
