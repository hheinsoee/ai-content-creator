DROP TABLE IF EXISTS posted_articles;
CREATE TABLE posted_articles (
  url TEXT PRIMARY KEY,
  title TEXT,
  posted_at INTEGER
);
