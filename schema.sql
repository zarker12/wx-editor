-- ===== Cloudflare D1 数据库建表脚本 =====
-- 用法：在 Cloudflare 控制台 D1 → Execute SQL 执行，或 wrangler d1 execute wechat-articles --file=schema.sql
-- 数据库绑定名：DB（见 wrangler.toml）

-- 订阅的公众号列表
CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,              -- 公众号名称（用户可读）
    rss_url TEXT NOT NULL UNIQUE,    -- RSS/Atom 订阅地址（来自 WeWe RSS / Mp2RSS）
    created_at TEXT DEFAULT (datetime('now')),
    last_synced_at TEXT              -- 最近一次同步时间
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_url ON subscriptions(rss_url);

-- 文章表（由同步层从 RSS 拉取写入）
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT,                     -- 公众号名称（关联 subscriptions.name）
    title TEXT,
    content TEXT,                    -- 正文摘要（去 HTML 标签）
    url TEXT,                        -- 原文链接
    pub_date TEXT,                   -- 发布时间（ISO 字符串）
    read_count INTEGER DEFAULT 0,    -- 阅读量（如 RSS 提供，否则 0）
    created_at TEXT DEFAULT (datetime('now'))
);

-- 以 url 去重（同步时 INSERT OR IGNORE 跳过已存在）
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_url ON articles(url);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_pub_date ON articles(pub_date);
