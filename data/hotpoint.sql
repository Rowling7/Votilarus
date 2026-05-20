-- ==================== 热点资讯数据表 ====================
CREATE TABLE IF NOT EXISTS hotpoint (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    -- 'weibo' 或 'baidu'
    rank INTEGER NOT NULL,
    -- 排名 1-50
    title TEXT NOT NULL,
    -- 热点标题
    hot_value TEXT,
    -- 热度值/指数
    url TEXT,
    -- 详情链接
    hot_date DATE NOT NULL,
    -- 热点日期 YYYY-MM-DD
    created_at DATETIME DEFAULT (datetime('now', 'localtime')),
    updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_hotpoint_source_date ON hotpoint(source, hot_date);

CREATE INDEX IF NOT EXISTS idx_hotpoint_rank ON hotpoint(rank);

CREATE INDEX IF NOT EXISTS idx_hotpoint_created ON hotpoint(created_at);