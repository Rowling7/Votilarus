const express = require('express');
const router = express.Router();
const https = require('https');

// 需要注入 db 对象
let db;

// API 配置
const API_URLS = {
    weibo: 'https://v2.xxapi.cn/api/weibohot',
    baidu: 'https://v2.xxapi.cn/api/baiduhot'
};

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

/**
 * 从第三方API获取热点数据
 * @param {string} source - 数据源 'weibo' 或 'baidu'
 * @returns {Promise<Array>} 热点数据数组
 */
function fetchHotpointFromAPI(source) {
    return new Promise((resolve, reject) => {
        const url = API_URLS[source];

        if (!url) {
            reject(new Error(`不支持的数据源: ${source}`));
            return;
        }

        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);

                    // 根据API返回格式解析数据
                    let hotList = [];

                    if (source === 'weibo') {
                        // 微博热搜格式适配
                        if (jsonData.code === 200 && jsonData.data) {
                            hotList = jsonData.data.map((item, index) => ({
                                rank: item.num || (index + 1),
                                title: item.title || item.word,
                                hot_value: item.hot || item.hotScore,
                                url: item.url || `https://s.weibo.com/weibo/${encodeURIComponent(item.title || item.word)}`
                            }));
                        }
                    } else if (source === 'baidu') {
                        // 百度热搜格式适配
                        if (jsonData.code === 200 && jsonData.data) {
                            hotList = jsonData.data.map((item, index) => ({
                                rank: item.index || (index + 1),
                                title: item.word || item.title,
                                hot_value: item.hotScore || item.hot,
                                url: item.url || `https://www.baidu.com/s?wd=${encodeURIComponent(item.word || item.title)}`
                            }));
                        }
                    }

                    if (hotList.length > 0) {
                        resolve(hotList.slice(0, 50)); // 最多50条
                    } else {
                        reject(new Error('API返回数据格式错误'));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * 保存热点数据到数据库
 * @param {string} source - 数据源
 * @param {Array} hotList - 热点列表
 * @returns {Promise<void>}
 */
function saveHotpointToDB(source, hotList) {
    return new Promise((resolve, reject) => {
        if (!hotList || hotList.length === 0) {
            resolve();
            return;
        }

        const now = new Date();
        const utc8Now = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        const dateStr = utc8Now.toISOString().slice(0, 10); // YYYY-MM-DD

        // 先删除该日期和来源的旧数据
        const deleteSql = `DELETE FROM hotpoint WHERE source = ? AND hot_date = ?`;

        db.run(deleteSql, [source, dateStr], function (deleteErr) {
            if (deleteErr) {
                console.error('[HotPoint] 删除旧数据失败:', deleteErr);
            }

            // 批量插入新数据
            let completed = 0;
            const total = hotList.length;
            let hasError = false;

            hotList.forEach(item => {
                const insertSql = `
                    INSERT INTO hotpoint (
                        source, rank, title, hot_value, url, hot_date,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                `;

                const params = [
                    source,
                    item.rank,
                    item.title,
                    item.hot_value || null,
                    item.url || null,
                    dateStr
                ];

                db.run(insertSql, params, function (err) {
                    if (err) {
                        console.error('[HotPoint] 插入数据失败:', err);
                        hasError = true;
                    }
                    completed++;
                    if (completed === total) {
                        if (hasError) {
                            reject(new Error('部分数据插入失败'));
                        } else {
                            resolve();
                        }
                    }
                });
            });
        });
    });
}

/**
 * 获取并保存热点数据
 * @param {string} source - 数据源
 * @returns {Promise<Object>}
 */
async function fetchAndSaveHotpoint(source) {
    try {
        // 1. 从API获取数据
        const hotList = await fetchHotpointFromAPI(source);

        // 2. 保存到数据库
        await saveHotpointToDB(source, hotList);

        return {
            success: true,
            count: hotList.length,
            source: source
        };
    } catch (error) {
        throw error;
    }
}

// ==================== API 路由 ====================

/**
 * GET /api/hotpoint/:source
 * 获取热点数据（优先从缓存，缓存失效则从API获取）
 */
router.get('/:source', async (req, res) => {
    try {
        const source = req.params.source;

        if (!['weibo', 'baidu'].includes(source)) {
            return res.status(400).json({
                success: false,
                error: '不支持的数据源'
            });
        }

        const limit = parseInt(req.query.limit) || 50;

        // 1. 查询有效缓存（30分钟内）
        const cacheSql = `
            SELECT * FROM hotpoint
            WHERE source = ?
              AND hot_date = DATE('now', 'localtime')
            ORDER BY rank ASC
            LIMIT ?
        `;

        db.all(cacheSql, [source, limit], async (err, cachedData) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // 如果缓存存在且是今天的数据，直接返回
            if (cachedData && cachedData.length > 0) {
                // 检查缓存时间是否在30分钟内
                const cacheTime = new Date(cachedData[0].created_at).getTime();
                const now = Date.now();
                const thirtyMinutes = 30 * 60 * 1000;

                if (now - cacheTime < thirtyMinutes) {
                    return res.json({
                        success: true,
                        fromCache: true,
                        data: cachedData,
                        lastUpdate: cachedData[0].created_at
                    });
                }
            }

            // 缓存不存在或已过期，从API获取
            try {
                await fetchAndSaveHotpoint(source);

                // 重新从数据库读取
                db.all(cacheSql, [source, limit], (err2, newData) => {
                    if (err2) {
                        return res.status(500).json({ error: err2.message });
                    }

                    res.json({
                        success: true,
                        fromCache: false,
                        data: newData || [],
                        lastUpdate: new Date().toISOString()
                    });
                });
            } catch (apiError) {
                // API请求失败，返回缓存数据（如果有）
                if (cachedData && cachedData.length > 0) {
                    return res.json({
                        success: true,
                        fromCache: true,
                        data: cachedData,
                        lastUpdate: cachedData[0].created_at,
                        warning: 'API请求失败，显示缓存数据'
                    });
                }

                res.status(500).json({
                    success: false,
                    error: apiError.message
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/hotpoint/refresh/:source
 * 强制刷新热点数据
 */
router.post('/refresh/:source', async (req, res) => {
    try {
        const source = req.params.source;

        if (!['weibo', 'baidu'].includes(source)) {
            return res.status(400).json({
                success: false,
                error: '不支持的数据源'
            });
        }

        const result = await fetchAndSaveHotpoint(source);

        res.json({
            success: true,
            message: '热点数据已刷新',
            ...result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/hotpoint/history/:source
 * 获取历史热点数据
 */
router.get('/history/:source', (req, res) => {
    const source = req.params.source;
    const date = req.query.date;
    const limit = parseInt(req.query.limit) || 50;

    let sql = `SELECT * FROM hotpoint WHERE source = ?`;
    const params = [source];

    if (date) {
        sql += ` AND hot_date = ?`;
        params.push(date);
    }

    sql += ` ORDER BY rank ASC LIMIT ?`;
    params.push(limit);

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    });
});

/**
 * POST /api/hotpoint/cleanup
 * 清理过期的热点数据（保留最近7天）
 */
router.post('/cleanup', (req, res) => {
    const sql = `
        DELETE FROM hotpoint 
        WHERE hot_date < DATE('now', 'localtime', '-7 days')
    `;

    db.run(sql, [], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({
            success: true,
            message: `已清理 ${this.changes} 条过期记录`
        });
    });
});

module.exports = {
    router,
    setDatabase,
    fetchAndSaveHotpoint
};
