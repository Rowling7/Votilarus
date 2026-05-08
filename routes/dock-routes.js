const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

// 获取 Dock 栏项
router.get('/', (req, res) => {
    const sql = 'SELECT d.item_id as id, i.title, i.link_url, i.icon_path FROM dock_items d JOIN icon_items i ON d.item_id = i.id ORDER BY d.sort_order ASC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 添加图标到 Dock
router.post('/', (req, res) => {
    const { item_id } = req.body;

    // 先检查是否已存在
    const checkSql = 'SELECT * FROM dock_items WHERE item_id = ?';
    db.get(checkSql, [item_id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (row) {
            res.status(400).json({ error: '该图标已在 Dock 中' });
            return;
        }

        // 获取当前最大 sort_order
        const maxSql = 'SELECT MAX(sort_order) as max_order FROM dock_items';
        db.get(maxSql, [], (err, result) => {
            const sortOrder = (result?.max_order || 0) + 1;

            const insertSql = 'INSERT INTO dock_items (item_id, sort_order) VALUES (?, ?)';
            db.run(insertSql, [item_id, sortOrder], function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ success: true, id: this.lastID });
            });
        });
    });
});

// 从 Dock 移除图标
router.delete('/:item_id', (req, res) => {
    const { item_id } = req.params;
    const sql = 'DELETE FROM dock_items WHERE item_id = ?';

    db.run(sql, [item_id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, changes: this.changes });
    });
});

// 更新 Dock 排序
router.put('/reorder', (req, res) => {
    const { items } = req.body; // [{ item_id, sort_order }, ...]
    const promises = [];

    items.forEach(item => {
        const promise = new Promise((resolve, reject) => {
            const sql = 'UPDATE dock_items SET sort_order = ? WHERE item_id = ?';
            db.run(sql, [item.sort_order, item.item_id], function (err) {
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
