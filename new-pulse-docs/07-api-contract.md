# API 계약

이 문서는 프론트엔드와 백엔드가 공유하는 REST API 계약이다. 구현 중 API 요청/응답 구조를 변경하려면 이 문서를 먼저 수정한다.

## 공통 규칙

- Base path: `/api`
- Response content type: `application/json`
- Time format: ISO-8601 string, timezone은 서버 기준 `Asia/Seoul`
- Category code는 영문 enum을 사용하고 화면 표시명은 응답에 함께 제공한다.
- 화면 route는 `/categories/industry`, `/categories/north-korea` 같은 lowercase slug를 사용하지만, API query와 response는 기존 enum code(`INDUSTRY`, `NORTH_KOREA`)를 유지한다.
- 로그인은 없다. 읽음 상태는 `clientId` query 또는 body 값으로 식별한다.
- Error response는 동일한 shape를 사용한다.

## Error Response

```json
{
  "code": "INVALID_REQUEST",
  "message": "category is required",
  "timestamp": "2026-05-21T10:15:30+09:00"
}
```

## Category

### `GET /api/categories`

카테고리 목록과 기사/미읽음 수를 반환한다.
`articleCount`는 해당 카테고리에 저장된 전체 기사 수이고, `unreadCount`는 요청 `clientId`의 읽음 상태를 제외한 수다.

Query:

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `clientId` | 아니오 | 읽음 수 계산용 익명 브라우저 식별자 |

Response:

```json
{
  "items": [
    {
      "code": "POLITICS",
      "name": "정치",
      "articleCount": 42,
      "unreadCount": 17
    }
  ]
}
```

## Article

### `GET /api/articles`

카테고리별 기사 목록을 최신순으로 반환한다. 정렬 기준은 `publishedAt DESC`, 같은 발행 시각에서는 `articleId DESC`다.
기본 page size는 50건이며, 프론트엔드 `더보기`는 응답의 `page.nextOffset`으로 다음 page를 요청한다.
검색/정렬 API는 과제 요구 범위를 넘기므로 제공하지 않는다.

Query:

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `category` | 예 | `POLITICS`, `NORTH_KOREA`, `ECONOMY`, `INDUSTRY`, `SOCIETY` |
| `clientId` | 아니오 | 읽음 여부 계산용 |
| `limit` | 아니오 | 기본 50, 최대 100. 0 이하는 `INVALID_REQUEST` |
| `offset` | 아니오 | 기본 0. 음수는 `INVALID_REQUEST` |

Response:

```json
{
  "category": {
    "code": "POLITICS",
    "name": "정치"
  },
  "items": [
    {
      "articleId": "AKR20260518104500055",
      "title": "기사 제목",
      "link": "https://www.yna.co.kr/view/AKR20260518104500055",
      "creator": "기자명",
      "publishedAt": "2026-05-18T14:42:49+09:00",
      "categories": ["POLITICS"],
      "read": false
    }
  ],
  "page": {
    "totalCount": 123,
    "limit": 50,
    "offset": 0,
    "hasNext": true,
    "nextOffset": 50
  }
}
```

Page metadata:

| 이름 | 설명 |
| --- | --- |
| `totalCount` | 현재 카테고리에 저장된 전체 기사 수 |
| `limit` | 이번 요청의 page size |
| `offset` | 이번 요청의 시작 위치 |
| `hasNext` | 다음 page 존재 여부 |
| `nextOffset` | 다음 page 요청에 사용할 offset. 다음 page가 없으면 `null` |

### `GET /api/articles/{articleId}`

기사 상세 메타데이터를 반환한다. 원문 본문 자체를 복제 저장하지 않는다.

Query:

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `clientId` | 아니오 | 읽음 여부 계산용 |

Response:

```json
{
  "articleId": "AKR20260518104500055",
  "title": "기사 제목",
  "link": "https://www.yna.co.kr/view/AKR20260518104500055",
  "creator": "기자명",
  "publishedAt": "2026-05-18T14:42:49+09:00",
  "categories": ["POLITICS"],
  "read": true
}
```

### `POST /api/articles/{articleId}/read`

익명 브라우저 client 기준으로 읽음 상태를 저장한다.

Request:

```json
{
  "clientId": "f9c4c020-82f7-4ac4-94c2-74d1b1c99b77"
}
```

Response:

```json
{
  "articleId": "AKR20260518104500055",
  "clientId": "f9c4c020-82f7-4ac4-94c2-74d1b1c99b77",
  "read": true,
  "readAt": "2026-05-21T10:15:30+09:00"
}
```

## Admin

관리 API는 로컬 검증과 시연용이다. 운영 proxy에서 외부 차단할 수 있도록 `/api/admin/**` 아래에 둔다.

### `POST /api/admin/rss/collect`

RSS 수집을 수동 실행한다.

Response:

```json
{
  "startedAt": "2026-05-21T10:15:30+09:00",
  "finishedAt": "2026-05-21T10:15:35+09:00",
  "feedCount": 5,
  "newArticleCount": 24,
  "skippedDuplicateCount": 8,
  "failedFeedCount": 0
}
```

### `POST /api/admin/push/dispatch`

저장된 기사 기준으로 푸시 발송 시뮬레이션을 수동 실행한다.

Response:

```json
{
  "startedAt": "2026-05-21T10:16:00+09:00",
  "finishedAt": "2026-05-21T10:16:05+09:00",
  "targetCount": 120,
  "successCount": 63,
  "failCount": 57,
  "skippedByDndCount": 31,
  "skippedDuplicateCount": 12
}
```

### `GET /api/admin/push-histories`

발송 이력을 조회한다.

Query:

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `limit` | 아니오 | 기본 100, 최대 500 |

Response:

```json
{
  "items": [
    {
      "id": 1,
      "userNo": 3,
      "pushType": "APNS",
      "articleId": "AKR20260518104500055",
      "title": "기사 제목",
      "category": "POLITICS",
      "sentAt": "2026-05-21T10:16:03+09:00",
      "status": "success"
    }
  ]
}
```

## Health

### `GET /api/health`

Response:

```json
{
  "status": "UP",
  "database": "UP",
  "timestamp": "2026-05-21T10:15:30+09:00"
}
```
