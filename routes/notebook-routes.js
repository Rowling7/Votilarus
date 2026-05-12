const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

// ==================== 备忘录 API ====================

// 获取备忘录列表
// 支持筛选参数: isdel, isdone, urgent, important
router.get('/list', (req, res) => {
    const { isdel, isdone, urgent, important } = req.query;

    let sql = 'SELECT * FROM notebook WHERE delete_flag = ?';
    const params = [isdel !== undefined ? parseInt(isdel) : 0];

    // 添加筛选条件
    if (isdone !== undefined) {
        sql += ' AND done_flag = ?';
        params.push(parseInt(isdone));
    }

    if (urgent !== undefined) {
        sql += ' AND urgent_flag = ?';
        params.push(parseInt(urgent));
    }

    if (important !== undefined) {
        sql += ' AND important_flag = ?';
        params.push(parseInt(important));
    }

    // 按置顶和排序字段排序
    sql += ' ORDER BY top_flag DESC, sort_order ASC, created_at DESC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({
                success: false,
                error: err.message
            });
            return;
        }

        res.json({
            success: true,
            data: rows
        });
    });
});

// 获取单个备忘录详情
router.get('/detail/:uuid', (req, res) => {
    const { uuid } = req.params;

    const sql = 'SELECT * FROM notebook WHERE uuid = ? AND delete_flag = 0';

    db.get(sql, [uuid], (err, row) => {
        if (err) {
            res.status(500).json({
                success: false,
                error: err.message
            });
            return;
        }

        if (!row) {
            res.status(404).json({
                success: false,
                error: '备忘录不存在'
            });
            return;
        }

        res.json({
            success: true,
            data: row
        });
    });
});

// 创建新备忘录
router.post('/', (req, res) => {
    const {
        uuid,
        title,
        content,
        starttime,
        endtime,
        sort_order,
        top_flag,
        urgent_flag,
        done_flag,
        important_flag,
        type
    } = req.body;

    if (!uuid) {
        res.status(400).json({
            success: false,
            error: '缺少必要参数: uuid'
        });
        return;
    }

    const insertSql = `INSERT INTO notebook 
        (uuid, title, content, starttime, endtime, sort_order, top_flag, 
         urgent_flag, done_flag, important_flag, type, created_at, updated_at, 
         delete_flag) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)`;

    db.run(insertSql, [
        uuid,
        title || null,
        content || null,
        starttime || null,
        endtime || null,
        sort_order || 0,
        top_flag !== undefined ? top_flag : 0,
        urgent_flag !== undefined ? urgent_flag : 0,
        done_flag !== undefined ? done_flag : 0,
        important_flag !== undefined ? important_flag : 0,
        type || 'work',
        0
    ], function (err) {
        if (err) {
            res.status(500).json({
                success: false,
                error: err.message
            });
            return;
        }

        res.json({
            success: true,
            message: '备忘录创建成功',
            uuid: uuid
        });
    });
});

// 更新备忘录
router.put('/:uuid', (req, res) => {
    const { uuid } = req.params;
    const {
        title,
        content,
        starttime,
        endtime,
        sort_order,
        top_flag,
        urgent_flag,
        done_flag,
        important_flag,
        type
    } = req.body;

    const updates = [];
    const params = [];

    if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
    }
    if (content !== undefined) {
        updates.push('content = ?');
        params.push(content);
    }
    if (starttime !== undefined) {
        updates.push('starttime = ?');
        params.push(starttime);
    }
    if (endtime !== undefined) {
        updates.push('endtime = ?');
        params.push(endtime);
    }
    if (sort_order !== undefined) {
        updates.push('sort_order = ?');
        params.push(sort_order);
    }
    if (top_flag !== undefined) {
        updates.push('top_flag = ?');
        params.push(top_flag);
    }
    if (urgent_flag !== undefined) {
        updates.push('urgent_flag = ?');
        params.push(urgent_flag);
    }
    if (done_flag !== undefined) {
        updates.push('done_flag = ?');
        params.push(done_flag);
    }
    if (important_flag !== undefined) {
        updates.push('important_flag = ?');
        params.push(important_flag);
    }
    if (type !== undefined) {
        updates.push('type = ?');
        params.push(type);
    }

    if (updates.length === 0) {
        res.status(400).json({
            success: false,
            error: '没有提供要更新的字段'
        });
        return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(uuid);

    const sql = `UPDATE notebook SET ${updates.join(', ')} WHERE uuid = ?`;

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({
                success: false,
                error: err.message
            });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({
                success: false,
                error: '备忘录不存在'
            });
            return;
        }

        res.json({
            success: true,
            changes: this.changes
        });
    });
});

// 删除备忘录（软删除）
router.delete('/:uuid', (req, res) => {
    const { uuid } = req.params;

    const sql = 'UPDATE notebook SET delete_flag = 1, delete_at = CURRENT_TIMESTAMP WHERE uuid = ?';

    db.run(sql, [uuid], function (err) {
        if (err) {
            res.status(500).json({
                success: false,
                error: err.message
            });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({
                success: false,
                error: '备忘录不存在'
            });
            return;
        }

        res.json({
            success: true,
            changes: this.changes
        });
    });
});

// 获取统计信息
// 返回重要、紧急、已完成、全部的数量
router.get('/statistics', (req, res) => {
    const sql = `
        SELECT 
            COUNT(CASE WHEN important_flag = 1 AND delete_flag = 0 THEN 1 END) AS cntImportant,
            COUNT(CASE WHEN urgent_flag = 1 AND delete_flag = 0 THEN 1 END) AS cntUrgent,
            COUNT(CASE WHEN done_flag = 1 AND delete_flag = 0 THEN 1 END) AS cntIsdone,
            COUNT(CASE WHEN delete_flag = 0 THEN 1 END) AS cntLive
        FROM notebook
    `;

    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(500).json({
                success: false,
                error: err.message
            });
            return;
        }

        res.json({
            success: true,
            data: [row]
        });
    });
});

module.exports = {
    router,
    setDatabase
};
