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
    const sql = 'SELECT * FROM A70 WHERE isdel = ? ORDER BY uuid ASC';
    
    db.all(sql, ['0'], (err, rows) => {
        if (err) {
            console.error('❌ [API] 查询分类失败:', err.message);
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
