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

module.exports = {
    router,
    setDatabase
};
