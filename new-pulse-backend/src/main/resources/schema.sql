CREATE TABLE IF NOT EXISTS articles (
  article_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT NOT NULL UNIQUE,
  creator TEXT,
  published_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS article_categories (
  article_id TEXT NOT NULL,
  category TEXT NOT NULL,
  PRIMARY KEY (article_id, category),
  FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  user_no INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  device_id TEXT NOT NULL,
  push_type TEXT NOT NULL CHECK (push_type IN ('APNS', 'FCM')),
  dnd_start TEXT,
  dnd_end TEXT
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_no INTEGER NOT NULL,
  category TEXT NOT NULL,
  PRIMARY KEY (user_no, category),
  FOREIGN KEY (user_no) REFERENCES users(user_no) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS push_histories (
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

CREATE TABLE IF NOT EXISTS article_read_states (
  client_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  read_at TEXT NOT NULL,
  PRIMARY KEY (client_id, article_id),
  FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_categories_category ON article_categories(category);
CREATE INDEX IF NOT EXISTS idx_user_preferences_category ON user_preferences(category);
CREATE INDEX IF NOT EXISTS idx_push_histories_sent_at ON push_histories(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_histories_article ON push_histories(article_id);
CREATE INDEX IF NOT EXISTS idx_article_read_states_client ON article_read_states(client_id);
