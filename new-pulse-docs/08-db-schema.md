# DB Schema

SQLite schema는 명시적인 `schema.sql`로 관리한다. 이 문서는 테이블, 인덱스, 제약, 확인 SQL의 기준이다.

## 설계 원칙

- article 본문 메타데이터와 category 매핑을 분리한다.
- 사용자 seed 데이터는 푸시 대상자 모델로만 사용한다.
- 웹 읽음 상태는 익명 `client_id` 기준으로 저장한다.
- 푸시 발송 이력은 append-only로 저장한다.
- 중복 기사와 중복 발송은 DB unique 제약으로도 방어한다.

## Tables

```sql
CREATE TABLE articles (
  article_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT NOT NULL UNIQUE,
  creator TEXT,
  published_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE article_categories (
  article_id TEXT NOT NULL,
  category TEXT NOT NULL,
  PRIMARY KEY (article_id, category),
  FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE
);

CREATE TABLE users (
  user_no INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  device_id TEXT NOT NULL,
  push_type TEXT NOT NULL CHECK (push_type IN ('APNS', 'FCM')),
  dnd_start TEXT,
  dnd_end TEXT
);

CREATE TABLE user_preferences (
  user_no INTEGER NOT NULL,
  category TEXT NOT NULL,
  PRIMARY KEY (user_no, category),
  FOREIGN KEY (user_no) REFERENCES users(user_no) ON DELETE CASCADE
);

CREATE TABLE push_histories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_no INTEGER NOT NULL,
  device_id TEXT NOT NULL,
  push_type TEXT NOT NULL CHECK (push_type IN ('APNS', 'FCM')),
  article_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'fail')),
  UNIQUE (user_no, article_id),
  FOREIGN KEY (user_no) REFERENCES users(user_no),
  FOREIGN KEY (article_id) REFERENCES articles(article_id)
);

CREATE TABLE article_read_states (
  client_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  read_at TEXT NOT NULL,
  PRIMARY KEY (client_id, article_id),
  FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE
);
```

## Indexes

```sql
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_article_categories_category ON article_categories(category);
CREATE INDEX idx_user_preferences_category ON user_preferences(category);
CREATE INDEX idx_push_histories_sent_at ON push_histories(sent_at DESC);
CREATE INDEX idx_push_histories_article ON push_histories(article_id);
CREATE INDEX idx_article_read_states_client ON article_read_states(client_id);
```

## Category Codes

| Code | Display |
| --- | --- |
| `POLITICS` | 정치 |
| `NORTH_KOREA` | 북한 |
| `ECONOMY` | 경제 |
| `INDUSTRY` | 산업 |
| `SOCIETY` | 사회 |

## Push Type Normalization

| Input | Stored |
| --- | --- |
| `APNs` | `APNS` |
| `APNS` | `APNS` |
| `FCM` | `FCM` |

## 확인 SQL

기사 저장 확인:

```sql
SELECT COUNT(*) AS article_count FROM articles;
SELECT category, COUNT(*) AS count
FROM article_categories
GROUP BY category
ORDER BY category;
```

사용자 seed 확인:

```sql
SELECT COUNT(*) AS user_count FROM users;
SELECT push_type, COUNT(*) AS count
FROM users
GROUP BY push_type;
```

푸시 이력 확인:

```sql
SELECT status, COUNT(*) AS count
FROM push_histories
GROUP BY status;

SELECT user_no, article_id, COUNT(*) AS count
FROM push_histories
GROUP BY user_no, article_id
HAVING COUNT(*) > 1;
```

읽음 상태 확인:

```sql
SELECT client_id, COUNT(*) AS read_count
FROM article_read_states
GROUP BY client_id
ORDER BY read_count DESC;
```

최대 기사 수 확인:

```sql
SELECT COUNT(*) <= 1000 AS within_limit FROM articles;
```
