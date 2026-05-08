const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

// 获取所有分类
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM icon_categories WHERE deleted_flag = ? ORDER BY id ASC';

    db.all(sql, ['0'], (err, rows) => {
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
