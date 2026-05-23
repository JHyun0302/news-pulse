# News Pulse 개발 기준 문서

이 폴더는 Codex가 `news-pulse` 사전과제 프로젝트를 구현할 때 반드시 따라야 하는 개발 기준만 보관한다.

## 문서 구성

- `00-codex-guardrails.md`: Codex 작업 원칙, 금지 사항, 변경 단위
- `01-requirements-summary.md`: 구현 범위와 불변 요구사항
- `02-architecture.md`: 시스템 아키텍처와 설계 결정 이유
- `03-backend-design.md`: Spring Boot 백엔드 패키지 구조, SOLID/OOP 기준, 데이터 모델
- `04-frontend-design.md`: React 프론트엔드 컴포넌트 구조와 상태 관리 기준
- `05-deployment-oci.md`: OCI/Docker 인프라 아키텍처와 배포 가드레일
- `06-security-governance.md`: 보안, 데이터, 공개 저장소 거버넌스
- `07-api-contract.md`: 프론트엔드/백엔드 REST API 계약
- `08-db-schema.md`: SQLite schema, index, 조회 SQL 기준
- `09-git-branch-strategy.md`: Git 브랜치, 커밋, merge 전략
- `harness/acceptance-matrix.md`: 기능별 검증 매트릭스
- `harness/codex-context.md`: 구현 작업에 주입할 AI 작업 컨텍스트
- `harness/implementation-sequence.md`: 개발 순서와 단계별 완료 기준
- `harness/milestone-roadmap.md`: 전체 작업 마일스톤과 산출물
- `harness/decision-gates.md`: 개발 중 사용자 선택이 필요한 결정 항목
- `harness/test-qa-strategy.md`: 테스트 작성 위치, 실행 명령, Chrome 직접 QA 절차
- `harness/fixture-policy.md`: 테스트 fixture와 seed 데이터 관리 기준
- `harness/definition-of-done.md`: 마일스톤별 완료 정의
- `harness/codex-session-prompts.md`: 총괄 PM이 세션별로 전달할 작업 프롬프트
- `harness/progress-log.md`: 세션별 완료 보고와 PM 인수인계 로그

## 기술 기준

- Backend: Spring Boot 4.0.6, Java 17, Maven, Spring Web MVC, Scheduling, JDBC, SQLite
- Frontend: React 19.2 계열, Vite 8, TypeScript, React Router, TanStack Query, Tailwind CSS 4.3, lucide-react
- DB: SQLite 파일 기반. 앱 런타임 DB와 검증 산출물 DB를 분리한다.
- Infra: OCI `edge-vm/front-vm/back-vm` 분리, Docker Compose, Nginx reverse proxy

## 문서 운영 규칙

- 구현 중 판단이 필요한 사항은 먼저 이 문서 세트에 설계 결정을 남긴 뒤 코드에 반영한다.
- 문서와 코드가 충돌하면 코드 수정 전에 문서를 먼저 갱신한다.
- 원본 과제 문서, 원본 사용자 데이터, 제출 안내 원문, 개인정보성 자료는 공개 문서와 코드에 복사하지 않는다.
- 사용자 선택이 필요한 항목은 `harness/decision-gates.md`에 선택지와 권장안을 먼저 제시하고, 결정 후 구현한다.
- 루트 `README.md`에는 Mermaid 원문 대신 이해하기 쉬운 이미지 다이어그램을 삽입한다. Mermaid 원문은 설계 문서에만 둔다.
