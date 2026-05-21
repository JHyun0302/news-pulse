# News Pulse

연합뉴스 RSS를 기반으로 카테고리별 뉴스 열람과 개인화 푸시 알림 시뮬레이션을 제공하는 사전과제 프로젝트입니다.

## Architecture

![News Pulse OCI Architecture](new-pulse-docs/assets/oci-architecture.svg)

핵심 흐름:

- 사용자는 `edge-vm`을 통해 서비스에 접근합니다.
- `front-vm`은 React 정적 파일을 제공하고 `/api` 요청을 백엔드로 프록시합니다.
- `back-vm`은 Spring Boot API, RSS 수집 스케줄러, SQLite 저장소를 담당합니다.
- 백엔드는 연합뉴스 RSS를 수집하고 사용자 선호 카테고리와 DND 시간을 기준으로 푸시 발송을 시뮬레이션합니다.

## Tech Stack

- Backend: Java 17, Spring Boot 4, Spring Web MVC, Spring JDBC, SQLite
- Frontend: React, TypeScript, Vite, TanStack Query, Tailwind CSS
- Infra: OCI `edge-vm/front-vm/back-vm`, Docker Compose, Nginx
- Test/QA: JUnit 5, AssertJ, Vitest, Playwright, Codex Chrome QA

## Project Structure

```text
new-pulse-backend/   # Spring Boot backend
new-pulse-frontend/  # React frontend
deploy/              # OCI edge/front/back deployment files
new-pulse-docs/      # architecture, harness, QA, deployment docs
docker-compose.local.yml
```

## Local Docker Run

프론트엔드 구현이 완료된 뒤 루트에서 아래 명령으로 정적 frontend와 backend를 함께 실행합니다.

```bash
docker compose -f docker-compose.local.yml up --build
```

로컬 포트:

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:8080/api/health`

로컬 compose는 SQLite를 Docker named volume `news-pulse-sqlite`에 저장합니다. 수동으로 삭제하지 않으면 컨테이너를 재생성해도 DB 파일이 유지됩니다.

## OCI Deployment Files

VM별 배포 파일은 역할별로 분리되어 있습니다.

```text
deploy/
  edge/nginx.conf              # public edge-vm reverse proxy
  front/docker-compose.yml     # front-vm frontend container
  front/nginx.conf             # frontend static server and /api proxy
  front/.env.example
  back/docker-compose.yml      # back-vm backend container
  back/.env.example
```

이미지 빌드는 루트에서 수행합니다.

```bash
docker build -f new-pulse-backend/Dockerfile -t news-pulse-backend:latest .
docker build -f new-pulse-frontend/Dockerfile -t news-pulse-frontend:latest .
```

운영 SQLite 경로는 back-vm host 기준 `/opt/news-pulse/data/news-pulse.sqlite`, 컨테이너 기준 `/app/data/news-pulse.sqlite`입니다. back-vm compose는 `BACKEND_BIND_ADDRESS`를 private IP로 지정해야 하며, backend port를 public internet에 직접 열지 않습니다.

## Design Docs

- [Development Guardrails](new-pulse-docs/00-codex-guardrails.md)
- [Architecture](new-pulse-docs/02-architecture.md)
- [Backend Design](new-pulse-docs/03-backend-design.md)
- [Frontend Design](new-pulse-docs/04-frontend-design.md)
- [OCI Deployment](new-pulse-docs/05-deployment-oci.md)
- [API Contract](new-pulse-docs/07-api-contract.md)
- [DB Schema](new-pulse-docs/08-db-schema.md)
- [Git Branch Strategy](new-pulse-docs/09-git-branch-strategy.md)

## Development Status

백엔드와 배포 산출물은 구현이 진행 중입니다. 프론트엔드 화면, 최종 테스트 명령, 스크린샷, SQLite 확인 SQL은 기능 구현과 QA 완료 후 이 README에 추가합니다.
