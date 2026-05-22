# Git 브랜치 전략

이 프로젝트는 제출 일정이 짧고 작업자가 소수인 과제형 프로젝트다. 장기 `develop` 브랜치를 두지 않고, `main`을 항상 실행 가능한 기준선으로 유지하는 GitHub Flow 방식을 사용한다.

## 브랜치 모델

```text
main
  ├─ feature/m1-project-skeleton
  ├─ feature/m2-backend-domain
  ├─ feature/m3-rss-collector
  ├─ feature/m4-push-dispatch
  ├─ feature/m5-article-api
  ├─ feature/m6-frontend
  ├─ feature/m7-qa-deliverables
  └─ docs/*
```

## 선택 이유

- 과제 제출물은 Public repository의 `main`을 기준으로 평가될 가능성이 높다. 따라서 `main`은 항상 실행 가능해야 한다.
- 장기 `develop` 브랜치는 짧은 과제 일정에서 merge 지연과 충돌 비용을 만든다.
- 마일스톤 단위 feature branch는 변경 범위와 검증 결과를 추적하기 쉽다.
- 문서 변경은 `docs/*`, 기능 구현은 `feature/*`, 결함 수정은 `fix/*`로 구분해 commit history를 읽기 쉽게 한다.

## 브랜치 규칙

| 브랜치 | 용도 | 병합 조건 |
| --- | --- | --- |
| `main` | 제출 기준 브랜치 | 항상 build/test 가능 |
| `feature/m{n}-...` | 마일스톤 기능 개발 | 관련 테스트 통과 후 merge |
| `fix/...` | 구현 중 발견한 결함 수정 | 재현 테스트 또는 검증 로그 포함 |
| `docs/...` | 설계/README/스크린샷 문서 변경 | 링크와 공개 금지 자료 포함 여부 확인 |
| `release/submission` | 최종 제출 직전 freeze branch, 필요 시 사용 | 전체 QA와 산출물 검증 완료 |

## 커밋 메시지 규칙

Conventional Commits를 따른다.

```text
feat: add rss article collector
fix: prevent duplicate push history insert
test: cover dnd time window crossing midnight
docs: add oci architecture diagram
chore: configure frontend tooling
```

## 커밋 단위와 Push 규칙

작업은 기능 단위 또는 검증 가능한 작은 작업 단위로 끊어 커밋한다. 하나의 커밋은 가능한 한 하나의 의도를 가져야 한다.

권장 커밋 단위:

- 프로젝트 골격 생성
- DB schema 추가
- value object와 unit test 추가
- RSS parser/client 구현
- push dispatch 구현
- article/read API 구현
- frontend API client 구현
- 특정 page 또는 component 구현
- 테스트 보강
- Docker/OCI 배포 파일 추가
- README/스크린샷 갱신

커밋 전 체크:

```bash
git status --short
git diff --check
```

커밋 예시:

```bash
git add new-pulse-backend/src/main/resources/schema.sql
git add new-pulse-backend/src/test/java/com/newpulse/article/ArticleRepositoryTest.java
git commit -m "feat: add sqlite article schema"

git add new-pulse-frontend/src/api new-pulse-frontend/src/hooks
git commit -m "feat: add frontend article api hooks"
```

Push 규칙:

- 작업 브랜치는 첫 커밋 후 원격에 push한다.
- 하루 이상 이어지는 작업은 중간 push로 백업한다.
- 테스트가 깨진 중간 상태를 push해야 한다면 커밋 메시지나 보고에 `WIP`와 깨진 테스트를 명시한다. 가능하면 `main`에는 깨진 상태를 병합하지 않는다.
- 마일스톤 완료 시 해당 feature branch를 push하고 총괄 PM에게 검증 결과를 보고한다.

Push 예시:

```bash
git checkout -b feature/m3-rss-collector
git push -u origin feature/m3-rss-collector

# 이후 작업 단위 커밋 후
git push
```

## Merge 기준

`main` 병합 전 최소 조건:

- 관련 테스트 통과
- 문서와 코드가 충돌하지 않음
- 원본 과제 첨부, 원본 Excel, `.env`, SQLite runtime DB 미포함
- 변경 범위가 해당 branch 목적을 벗어나지 않음
- README나 설계 문서의 실행 명령이 깨지지 않음

## 마일스톤별 브랜치

| 마일스톤 | 브랜치 | 주요 산출물 |
| --- | --- | --- |
| M1 | `feature/m1-project-skeleton` | backend/frontend skeleton, local compose |
| M2 | `feature/m2-backend-domain` | schema, value object, repository 기반 |
| M3 | `feature/m3-rss-collector` | RSS parser/client/scheduler |
| M4 | `feature/m4-push-dispatch` | user seed, push simulation, history |
| M5 | `feature/m5-article-api` | category/article/read API |
| M6 | `feature/m6-frontend` | React 화면과 컴포넌트 |
| M7 | `feature/m7-qa-deliverables` | Playwright, Chrome QA, screenshots, DB/CSV |
| M8 | `feature/m8-oci-deploy` | edge/front/back deploy files |

## 운영 가드레일

- `main`에서 직접 대규모 기능 개발을 하지 않는다.
- 한 브랜치는 하나의 마일스톤 또는 하나의 결함 수정만 담당한다.
- 충돌 해결 과정에서 사용자 변경을 되돌리지 않는다.
- 최종 제출 전에는 `release/submission`을 만들 수 있지만, 제출 URL은 `main`이 완성된 상태여야 한다.
- 태그는 최종 제출 직전 `v1.0-submission`처럼 남긴다.
