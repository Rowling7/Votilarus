const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

// ==================== 浏览器历史记录 API ====================

// 添加单条历史记录
router.post('/add', (req, res) => {
    const {
        url,
        title,
        icon_path,
        last_visit_at
    } = req.body;

    if (!url) {
        res.status(400).json({
            success: false,
            error: '缺少必要参数: url'
        });
        return;
    }

    const sql = `INSERT INTO history 
        (icon_path, url, title, last_visit_at, created_at, updated_at, deleted_flag) 
        VALUES (?, ?, ?, ?, datetime('now','localtime'), datetime('now','localtime'), 0)`;

    db.run(sql, [
        icon_path || null,
        url,
        title || null,
        last_visit_at || null
    ], function (err) {
        if (err) {
            console.error('添加历史记录失败:', err.message);
            res.status(500).json({
                success: false,
                error: err.message
            });
            return;
        }

        res.json({
            success: true,
            message: '历史记录添加成功',
            id: this.lastID
        });
    });
});

// 批量添加历史记录
router.post('/batch-add', (req, res) => {
    const { records } = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
        res.status(400).json({
            success: false,
            error: '缺少必要参数: records (非空数组)'
        });
        return;
    }

    const sql = `INSERT INTO history 
        (icon_path, url, title, last_visit_at, created_at, updated_at, deleted_flag) 
        VALUES (?, ?, ?, ?, datetime('now','localtime'), datetime('now','localtime'), 0)`;

    let successCount = 0;
    let errorCount = 0;
    let totalRecords = records.length;

    // 使用事务批量插入
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const stmt = db.prepare(sql);

        records.forEach((record) => {
            stmt.run([
                record.icon_path || null,
                record.url,
                record.title || null,
                record.last_visit_at || null
            ], function (err) {
                if (err) {
                    console.error('批量插入单条失败:', err.message);
                    errorCount++;
                } else {
                    successCount++;
                }

                // 当所有记录都处理完毕时返回结果
                if (successCount + errorCount >= totalRecords) {
                    db.run('COMMIT', () => {
                        res.json({
                            success: true,
                            message: `批量添加完成: 成功 ${successCount} 条, 失败 ${errorCount} 条`,
                            successCount: successCount,
                            errorCount: errorCount
                        });
                    });
                }
            });
        });

        stmt.finalize();
    });
});

// 查询历史记录列表
router.get('/list', (req, res) => {
    const {
        page = 1,
        pageSize = 20,
        keyword = '',
        dateFrom = '',
        dateTo = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // 基础条件
    let whereClause = 'WHERE deleted_flag = 0';
    let params = [];

    // 关键词搜索（url 或 title）
    if (keyword) {
        whereClause += ' AND (url LIKE ? OR title LIKE ?)';
        const likeKeyword = `%${keyword}%`;
        params.push(likeKeyword, likeKeyword);
    }

    // 日期范围筛选
    if (dateFrom) {
        whereClause += ' AND last_visit_at >= ?';
        params.push(dateFrom);
    }

    if (dateTo) {
        whereClause += ' AND last_visit_at <= ?';
        params.push(dateTo);
    }

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM history ${whereClause}`;
    // 查询数据
    const dataSql = `SELECT * FROM history ${whereClause} ORDER BY last_visit_at DESC LIMIT ? OFFSET ?`;

    db.get(countSql, params, (err, countResult) => {
        if (err) {
            console.error('查询历史记录总数失败:', err.message);
            res.status(500).json({
                success: false,
                error: err.message
            });
            return;
        }

        const total = countResult ? countResult.total : 0;

        // 查询数据
        db.all(dataSql, [...params, limit, offset], (err, rows) => {
            if (err) {
                console.error('查询历史记录数据失败:', err.message);
                res.status(500).json({
                    success: false,
                    error: err.message
                });
                return;
            }

            res.json({
                success: true,
                data: rows,
                pagination: {
                    total: total,
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    totalPages: Math.ceil(total / parseInt(pageSize))
                }
            });
        });
    });
});

// 删除历史记录（软删除）
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({
            success: false,
            error: '缺少必要参数: id'
        });
        return;
    }

    const sql = `UPDATE history 
        SET deleted_flag = 1, deleted_at = datetime('now','localtime'), updated_at = datetime('now','localtime') 
        WHERE id = ? AND deleted_flag = 0`;

    db.run(sql, [id], function (err) {
        if (err) {
            console.error('删除历史记录失败:', err.message);
            res.status(500).json({
                success: false,
                error: err.message
            });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({
                success: false,
                error: '记录不存在或已被删除'
            });
            return;
        }

        res.json({
            success: true,
            message: '历史记录已删除',
            changes: this.changes
        });
    });
});

module.exports = {
    router,
    setDatabase
};
