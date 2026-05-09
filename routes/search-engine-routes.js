const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

// 获取所有搜索引擎（按 sort_order 排序）
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM icon_search WHERE delete_flag = ? ORDER BY sort_order ASC';

    db.all(sql, ['0'], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 创建新搜索引擎
router.post('/', (req, res) => {
    const { title, title_en, url, icon_path, sort_order } = req.body;

    if (!title || !title_en || !url) {
        res.status(400).json({ error: '缺少必要参数' });
        return;
    }

    // 如果没有提供 sort_order，则自动分配最大值+1
    let sortOrder = sort_order;
    if (sortOrder === undefined || sortOrder === null) {
        db.get('SELECT MAX(sort_order) as max_order FROM icon_search', [], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            sortOrder = row.max_order ? row.max_order + 1 : 1;
            insertEngine(title, title_en, url, icon_path, sortOrder, res);
        });
    } else {
        insertEngine(title, title_en, url, icon_path, parseInt(sortOrder), res);
    }
});

// 插入搜索引擎的辅助函数
function insertEngine(title, title_en, url, icon_path, sort_order, res) {
    const insertSql = 'INSERT INTO icon_search (title, title_en, url, icon_path, sort_order, created_at, updated_at, delete_flag) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)';

    db.run(insertSql, [title, title_en, url, icon_path || null, sort_order, '0'], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({
            success: true,
            id: this.lastID,
            message: '搜索引擎添加成功'
        });
    });
}

// 更新搜索引擎信息
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, title_en, url, icon_path, sort_order } = req.body;

    // 构建动态 SQL
    const updates = [];
    const params = [];

    if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
    }
    if (title_en !== undefined) {
        updates.push('title_en = ?');
        params.push(title_en);
    }
    if (url !== undefined) {
        updates.push('url = ?');
        params.push(url);
    }
    if (icon_path !== undefined) {
        updates.push('icon_path = ?');
        params.push(icon_path);
    }
    if (sort_order !== undefined) {
        updates.push('sort_order = ?');
        params.push(parseInt(sort_order));
    }

    if (updates.length === 0) {
        res.status(400).json({ error: '没有提供要更新的字段' });
        return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const sql = `UPDATE icon_search SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: '搜索引擎不存在' });
            return;
        }

        res.json({ success: true, changes: this.changes });
    });
});

// 删除搜索引擎（软删除）
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    // 软删除：更新 delete_flag 字段
    const sql = 'UPDATE icon_search SET delete_flag = ?, deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
    db.run(sql, ['1', id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: '搜索引擎不存在' });
            return;
        }

        res.json({ success: true, changes: this.changes });
    });
});

// 批量更新搜索引擎排序
router.put('/reorder', (req, res) => {
    const { items } = req.body; // [{ id, sort_order }, ...]

    if (!items || !Array.isArray(items)) {
        res.status(400).json({ error: '无效的数据格式' });
        return;
    }

    const promises = [];

    items.forEach(item => {
        const promise = new Promise((resolve, reject) => {
            const sql = 'UPDATE icon_search SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            db.run(sql, [item.sort_order, item.id], function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
        promises.push(promise);
    });

    Promise.all(promises)
        .then(() => {
            res.json({ success: true });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

module.exports = {
    router,
    setDatabase
};