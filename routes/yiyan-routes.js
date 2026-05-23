const express = require('express');
const router = express.Router();
const https = require('https');
const TimeUtils = require('../public/js/utils/TimeUtils.js');

// 需要注入 db 对象
let db;

// API 配置
const API_URLS = {
    dujitang: 'https://v2.xxapi.cn/api/dujitang',
    weibo: 'https://v2.xxapi.cn/api/yiyan?type=hitokoto'
};

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

/**
 * 从第三方API获取一言数据
 * @param {string} source - 数据源 'dujitang' 或 'weibo'
 * @returns {Promise<Object>} 一言数据对象
 */
function fetchYiyanFromAPI(source) {
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
                    let content = '';

                    if (source === 'dujitang') {
                        // 毒鸡汤格式: {"code":200,"msg":"数据请求成功","data":"一言内容","request_id":"..."}
                        if (jsonData.code === 200 && jsonData.data) {
                            // data 直接是字符串
                            content = typeof jsonData.data === 'string' ? jsonData.data : '';
                        }
                    } else if (source === 'weibo') {
                        // 一言格式: {"code":200,"msg":"数据请求成功","data":"一言内容","request_id":"..."}
                        if (jsonData.code === 200 && jsonData.data) {
                            // data 直接是字符串
                            content = typeof jsonData.data === 'string' ? jsonData.data : '';
                        }
                    }

                    if (content) {
                        resolve({
                            content: content,
                            source: source
                        });
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
 * 检查一言是否已收藏
 * @param {string} content - 一言内容
 * @returns {Promise<Object>}
 */
function checkFavorite(content) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM yiyan WHERE content = ? AND delete_flag = '0' LIMIT 1`;

        db.get(sql, [content], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    isFavorite: !!row,
                    id: row ? row.id : null
                });
            }
        });
    });
}

/**
 * 收藏一言到数据库
 * @param {string} content - 一言内容
 * @returns {Promise<Object>}
 */
function addToFavorites(content) {
    return new Promise((resolve, reject) => {
        const now = TimeUtils.formatBeijingTime();

        // 先检查是否已存在
        const checkSql = `SELECT id, delete_flag FROM yiyan WHERE content = ? LIMIT 1`;

        db.get(checkSql, [content], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (row) {
                // 已存在，更新 delete_flag
                if (row.delete_flag === '1') {
                    // 之前被删除了，恢复
                    const updateSql = `UPDATE yiyan SET delete_flag = '0', updated_at = ? WHERE id = ?`;
                    db.run(updateSql, [now, row.id], function (updateErr) {
                        if (updateErr) {
                            reject(updateErr);
                        } else {
                            resolve({ success: true, id: row.id, action: 'restored' });
                        }
                    });
                } else {
                    // 已经收藏了
                    resolve({ success: true, id: row.id, action: 'already_exists' });
                }
            } else {
                // 不存在，插入新记录
                const insertSql = `
                    INSERT INTO yiyan (content, created_at, updated_at, delete_flag)
                    VALUES (?, ?, ?, '0')
                `;

                db.run(insertSql, [content, now, now], function (insertErr) {
                    if (insertErr) {
                        reject(insertErr);
                    } else {
                        resolve({ success: true, id: this.lastID, action: 'inserted' });
                    }
                });
            }
        });
    });
}

/**
 * 取消收藏（软删除）
 * @param {string} content - 一言内容
 * @returns {Promise<Object>}
 */
function removeFromFavorites(content) {
    return new Promise((resolve, reject) => {
        const now = TimeUtils.formatBeijingTime();

        const sql = `UPDATE yiyan SET delete_flag = '1', deleted_at = ?, updated_at = ? WHERE content = ? AND delete_flag = '0'`;

        db.run(sql, [now, now, content], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    success: true,
                    changes: this.changes,
                    message: this.changes > 0 ? '取消收藏成功' : '未找到该收藏'
                });
            }
        });
    });
}

// ==================== API 路由 ====================

/**
 * GET /api/yiyan/random/:source
 * 获取随机一言
 */
router.get('/random/:source', async (req, res) => {
    try {
        const source = req.params.source;

        if (!['dujitang', 'weibo'].includes(source)) {
            return res.status(400).json({
                success: false,
                error: '不支持的数据源'
            });
        }

        // 从API获取一言
        const yiyanData = await fetchYiyanFromAPI(source);

        res.json({
            success: true,
            data: yiyanData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/yiyan/favorite
 * 收藏一言
 */
router.post('/favorite', async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                error: '内容不能为空'
            });
        }

        const result = await addToFavorites(content);

        res.json({
            success: true,
            message: '收藏成功',
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
 * DELETE /api/yiyan/favorite
 * 取消收藏
 */
router.delete('/favorite', async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                error: '内容不能为空'
            });
        }

        const result = await removeFromFavorites(content);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: '未找到该收藏'
            });
        }

        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/yiyan/check
 * 检查一言是否已收藏
 */
router.get('/check', async (req, res) => {
    try {
        const { content } = req.query;

        if (!content) {
            return res.status(400).json({
                success: false,
                error: '内容不能为空'
            });
        }

        const result = await checkFavorite(content);

        res.json({
            success: true,
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
 * GET /api/yiyan/favorites
 * 获取所有收藏的一言列表
 */
router.get('/favorites', async (req, res) => {
    try {
        const sql = `
            SELECT id, content, created_at 
            FROM yiyan 
            WHERE delete_flag = '0' 
            ORDER BY created_at DESC
        `;

        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            res.json({
                success: true,
                data: rows || []
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/yiyan/favorite/:id
 * 根据ID删除收藏（软删除）
 */
router.delete('/favorite/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const now = TimeUtils.formatBeijingTime();

        const sql = `
            UPDATE yiyan 
            SET delete_flag = '1', deleted_at = ?, updated_at = ? 
            WHERE id = ? AND delete_flag = '0'
        `;

        db.run(sql, [now, now, id], function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    error: '未找到该收藏或已被删除'
                });
            }

            res.json({
                success: true,
                message: '删除成功'
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = {
    router,
    setDatabase
};
