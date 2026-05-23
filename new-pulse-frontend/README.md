# News Pulse 프론트엔드

React 기반 뉴스 열람 UI 모듈입니다. 카테고리 현황, 최신순 기사 목록, 50건 단위 더보기, 읽음/미읽음 표시, 기사 상세와 원문 새 탭 이동을 담당합니다.

전체 프로젝트 실행 흐름과 제출 산출물은 [루트 README](../README.md)를 기준으로 확인합니다.

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 화면 | React 19, TypeScript |
| 빌드 | Vite 8 |
| 라우팅 | React Router |
| 서버 상태 | TanStack Query |
| 스타일 | Tailwind CSS |
| 아이콘 | lucide-react |
| 테스트 | Vitest, React Testing Library, Playwright |

## 로컬 실행

아래 명령은 `new-pulse-frontend` 디렉터리에서 실행합니다.

백엔드를 먼저 `localhost:8080`에서 실행합니다.

```bash
cd ../new-pulse-backend
./mvnw spring-boot:run -Dspring-boot.run.arguments="--news-pulse.rss.scheduler.enabled=false"
```

다른 터미널에서 프론트엔드를 실행합니다.

```bash
npm install
npm run dev -- --port 5173
```

접속 URL:

```text
http://localhost:5173/
```

개발 서버는 기본적으로 `/api` 요청을 `http://localhost:8080`으로 프록시합니다. 백엔드 포트가 다르면 `VITE_DEV_API_TARGET`으로 바꿉니다.

```bash
VITE_DEV_API_TARGET=http://localhost:18081 npm run dev -- --port 5173
```

`VITE_API_BASE_URL`은 동일 출처 프록시를 우회해야 할 때만 사용합니다. 일반 로컬 개발, Docker, OCI front-vm 배포에서는 비워 둡니다.

## 테스트와 빌드

아래 명령은 `new-pulse-frontend` 디렉터리에서 실행합니다.

```bash
npm test
npm run build
```

최종 QA 기준 프론트엔드 단위/컴포넌트 테스트는 24개 통과 상태입니다.

Playwright E2E는 백엔드가 실행 중인 상태에서 실행합니다.

```bash
npx playwright test
```

`package.json`에는 같은 명령을 실행하는 스크립트도 있습니다.

```bash
npm run test:e2e
```

최종 QA 기준 Playwright는 3개 통과 상태입니다.

## 화면 흐름

| 경로 | 화면 |
| --- | --- |
| `/` | 카테고리 현황 |
| `/categories/:categorySlug` | 카테고리별 기사 목록 |
| `/articles/:articleId` | 기사 상세 메타데이터와 원문 링크 |

## URL/API 정책

화면 URL은 lowercase/kebab-case slug를 사용합니다.

| 카테고리 | 화면 URL 예시 | API query |
| --- | --- | --- |
| 정치 | `/categories/politics` | `category=POLITICS` |
| 북한 | `/categories/north-korea` | `category=NORTH_KOREA` |
| 경제 | `/categories/economy` | `category=ECONOMY` |
| 산업 | `/categories/industry` | `category=INDUSTRY` |
| 사회 | `/categories/society` | `category=SOCIETY` |

API 요청과 응답은 기존 enum code를 유지합니다. 기존 대문자 enum URL로 접근해도 호환 처리 후 표준 lowercase slug로 정리됩니다.

## 주요 기능

- 카테고리 현황에서 저장된 전체 기사 수와 미읽음 수 표시
- 카테고리별 최신순 기사 목록 표시
- `limit=50`, `offset` 기반 50건 단위 `더보기`
- 읽음/미읽음 상태를 제목 강조, 배지, 아이콘으로 구분
- 기사 상세 진입 시 읽음 처리 API 호출
- `연합뉴스 원문 보기` 버튼으로 원문을 새 탭에서 열기
- 상세 화면에서 목록으로 복귀 시 표준 slug URL 유지
- 모바일 viewport에서 텍스트 겹침과 가로 넘침 없이 표시

## 구조

| 경로 | 책임 |
| --- | --- |
| `src/api` | REST API 호출 함수와 DTO 처리 |
| `src/hooks` | TanStack Query hook, 캐시 키와 pagination 흐름 |
| `src/components` | 카테고리 카드, 기사 row, 상태 배지, 공통 UI |
| `src/pages` | route 단위 화면과 query 조합 |
| `src/utils` | 카테고리 slug 변환, 날짜 포맷, client id 생성 |
| `src/types` | API 응답과 화면에서 공유하는 타입 |
| `src/app` | router와 앱 진입 구성 |

## 설계 판단

- 서버 데이터 목록과 읽음 상태 갱신이 핵심이므로 TanStack Query로 fetch, cache, refetch, 무한 쿼리 기반 pagination을 관리합니다.
- `localStorage`는 익명 `client_id` 보관에만 사용합니다. 읽음 상태 자체는 백엔드 SQLite의 `article_read_states`에 저장합니다.
- 본문은 앱에서 복제 저장하지 않고 `연합뉴스 원문 보기`를 새 탭으로 엽니다. 원문 출처와 최신 본문을 유지하고, iframe 차단 정책과 본문 수집/저장에 따른 저작권·sanitizing 문제를 피하기 위한 선택입니다.
- 검색/정렬은 과제 요구 범위를 넘기므로 제외하고, 최신순 읽기와 더보기 흐름에 집중했습니다.
- 별도 새로고침 버튼은 제거했습니다. 목록 진입, 카테고리 변경, 더보기, 쿼리 무효화만으로 필요한 갱신 흐름을 유지하고 화면 컨트롤을 줄이기 위한 결정입니다.
- 프론트엔드는 같은 origin의 `/api` 호출을 기본으로 하며, 로컬 Vite 프록시와 Docker/OCI Nginx 프록시가 백엔드 연결을 담당합니다.

## 참고 문서

- [Frontend Design](../new-pulse-docs/04-frontend-design.md)
- [API Contract](../new-pulse-docs/07-api-contract.md)
- [OCI Deployment](../new-pulse-docs/05-deployment-oci.md)
