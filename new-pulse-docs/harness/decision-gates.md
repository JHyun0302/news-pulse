# 선택 게이트

개발자가 임의로 결정하면 이후 구조 변경 비용이 큰 항목을 모은다. 각 항목은 선택지와 권장안을 제시하고, 사용자의 결정이 필요하면 구현 전에 멈춰 확인한다.

| ID | 결정 시점 | 선택 항목 | 선택지 | 권장안 | 권장 이유 | 사용자 결정 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | M0 | 백엔드 빌드 도구 | Maven / Gradle | Maven | Spring Initializr 기본 흐름과 평가자 실행 재현성이 좋음 | 아니오 |
| D2 | M0 | 백엔드 데이터 접근 | Spring JDBC / JPA | Spring JDBC | SQLite 과제에서 SQL과 schema 검증이 명확하고 과한 ORM 복잡도를 피함 | 아니오 |
| D3 | M0 | 프론트엔드 상태 관리 | TanStack Query only / Zustand 추가 / Redux | TanStack Query only | 서버 상태 중심 앱이라 별도 전역 상태가 불필요 | 아니오 |
| D4 | M0 | UI 스타일링 | Tailwind CSS / CSS Modules / MUI | Tailwind CSS | 짧은 기간에 일관된 반응형 UI 구현 가능 | 아니오 |
| D5 | M1 | Java 버전 | 17 / 21 | 17 | Spring Boot 4 요구사항 충족, 평가자 환경 호환성 우선 | 예 |
| D6 | M1 | Node 패키지 매니저 | npm / pnpm / yarn | npm | 평가자 실행 부담과 기본 호환성 우선 | 예 |
| D7 | M2 | schema 초기화 방식 | `schema.sql` 직접 실행 / Flyway | `schema.sql` 직접 실행 | 과제 규모에서는 단순 SQL 초기화가 충분함 | 예 |
| D8 | M3 | RSS feed URL 관리 | 설정 파일 고정 / RSS index 페이지 런타임 파싱 | 설정 파일 고정 | 런타임 HTML 구조 변화에 덜 취약하고 테스트 쉬움 | 예 |
| D9 | M4 | 사용자 데이터 적재 | Excel runtime import / CSV seed 변환 / SQL seed | CSV seed 변환 + 원본 미커밋 | 원본 Excel 노출을 피하면서 재현성 확보 | 예 |
| D10 | M4 | DND 시간대 기사 처리 | 발송 건너뜀 / 보류 후 재시도 | 발송 건너뜀 | 과제 요구의 핵심은 제외 처리이며 보류 큐는 범위 확장 | 예 |
| D11 | M5 | 읽음 상태 식별자 | browser clientId / 샘플 user_no / 로그인 mock | browser clientId | 로그인 요구가 없고 프론트 사용자 흐름 검증에 충분 | 예 |
| D12 | M6 | 본문 페이지 처리 | 새 탭 열기 / iframe / 둘 다 | 새 탭 열기 + fallback 안내 | 원문 사이트의 iframe 차단 가능성을 피함 | 예 |
| D13 | M6 | 화면 밀도 | 카드형 / 리스트 중심 / 테이블형 | 리스트 중심 | 뉴스 열람 앱은 제목과 메타데이터 스캔이 핵심 | 예 |
| D14 | M7 | 브라우저 QA 기준 | Playwright만 / Codex Chrome 직접 QA 추가 | Codex Chrome 직접 QA 추가 | 실제 Chrome 환경에서 콘솔 오류와 사용자 흐름 확인 가능 | 아니오 |
| D15 | M8 | OCI 공개 방식 | 단일 VM 직접 노출 / `edge-vm -> front-vm -> back-vm` 분리 / 포트 기반 임시 공개 | `edge-vm -> front-vm -> back-vm` 분리 | 외부 진입점을 edge에 모으고 frontend/backend 네트워크 노출을 최소화함 | 예 |

## 결정 운영 규칙

- `사용자 결정 필요`가 `예`인 항목은 해당 마일스톤 시작 전에 선택지를 다시 제시한다.
- 사용자가 선택하면 결정 결과를 이 문서의 `결정 결과` 섹션에 기록한다.
- 결정 후에는 구현 중 임의로 바꾸지 않는다. 변경이 필요하면 다시 선택지를 제시한다.

## 결정 결과

| ID | 결정 | 기록일 | 근거 |
| --- | --- | --- | --- |
| D11 | A. 로그인 없음 + browser `client_id`; 읽음 상태는 `client_id + article_id`로 저장 | 2026-05-21 | 로그인 요구사항이 없고, 웹 읽음 상태와 푸시 대상 사용자 데이터를 분리하는 편이 과제 범위에 맞음 |
| D5 | Java 17 | 2026-05-21 | Spring Boot 4 요구사항을 충족하면서 평가자 로컬 환경 호환성이 Java 21보다 높음 |
| D6 | npm | 2026-05-21 | Node 기본 패키지 매니저라 별도 설치 설명이 적고 재현성이 좋음 |
| D7 | `schema.sql` 직접 실행 | 2026-05-21 | SQLite 고정 과제에서는 명시적 DDL이 가장 검증하기 쉽고 Flyway 도입 비용이 큼 |
| D8 | RSS URL은 설정 파일에 고정 | 2026-05-21 | RSS index HTML 구조 변화에 의존하지 않고 테스트 fixture와 운영 설정을 분리하기 쉬움 |
| D9 | CSV seed 변환 + 원본 Excel 미커밋 | 2026-05-21 | 원본 파일 공개를 피하면서 평가자가 seed 적재 과정을 재현하기 쉬움 |
| D10 | DND 시간대 기사는 발송 건너뜀 | 2026-05-21 | 과제 핵심은 DND 제외이며 보류/재시도 큐는 범위를 과하게 넓힘 |
| D12 | 본문은 새 탭 열기 중심, iframe은 사용하지 않음 | 2026-05-21 | 언론사 원문 페이지가 iframe 차단 정책을 둘 수 있어 새 탭 방식이 더 안정적임 |
| D13 | 리스트 중심 UI | 2026-05-21 | 뉴스 열람은 제목, 기자명, 발행시간을 빠르게 스캔하는 흐름이 핵심임 |
| D15 | OCI는 `edge-vm/front-vm/back-vm` 분리 구조 | 2026-05-21 | edge가 외부 진입과 TLS/proxy를 담당하고 front/back을 분리해 네트워크 노출을 최소화함 |

## 선택 근거 요약

- 실행 재현성이 평가 품질에 직접 영향을 주므로 Java 17, npm, `schema.sql`처럼 평가자가 바로 이해하고 실행하기 쉬운 선택을 우선한다.
- 과제 요구는 RSS 수집, 읽음 상태, 푸시 이력 저장의 정확성이다. 보류 큐, 로그인, Redis, 런타임 RSS index 파싱처럼 핵심 외 복잡도는 제외한다.
- 공개 저장소에 원본 첨부를 올리지 않아야 하므로 사용자 데이터는 CSV seed로 변환하고 원본 Excel은 커밋하지 않는다.
- UI는 뉴스 서비스 특성상 카드 장식보다 리스트 가독성과 상태 구분이 중요하다.
- OCI는 `edge-vm/front-vm/back-vm` 분리로 외부 노출면을 edge에 모으고, 백엔드는 내부망에서만 접근하게 한다.
