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
    const sql = 'SELECT d.*, i.name, i.target, i.bgimage FROM dock_items d JOIN A7001 i ON d.item_uuid = i.uuid ORDER BY d.sort_order ASC';
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
    const { item_uuid } = req.body;
    
    // 先检查是否已存在
    const checkSql = 'SELECT * FROM dock_items WHERE item_uuid = ?';
    db.get(checkSql, [item_uuid], (err, row) => {
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
            
            const insertSql = 'INSERT INTO dock_items (item_uuid, sort_order) VALUES (?, ?)';
            db.run(insertSql, [item_uuid, sortOrder], function(err) {
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
router.delete('/:item_uuid', (req, res) => {
    const { item_uuid } = req.params;
    const sql = 'DELETE FROM dock_items WHERE item_uuid = ?';
    
    db.run(sql, [item_uuid], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, changes: this.changes });
    });
});

// 更新 Dock 排序
router.put('/reorder', (req, res) => {
    const { items } = req.body; // [{ item_uuid, sort_order }, ...]
    const promises = [];
    
    items.forEach(item => {
        const promise = new Promise((resolve, reject) => {
            const sql = 'UPDATE dock_items SET sort_order = ? WHERE item_uuid = ?';
            db.run(sql, [item.sort_order, item.item_uuid], function(err) {
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
