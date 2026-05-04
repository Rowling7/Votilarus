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
    
    console.log('📂 [API] 请求分类列表');
    console.log('  - SQL:', sql);
    
    db.all(sql, ['0'], (err, rows) => {
        if (err) {
            console.error('  - ❌ 查询错误:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        console.log('  - ✅ 查询结果数量:', rows.length);
        if (rows.length > 0) {
            console.log('  - 分类列表:', rows.map(r => ({ uuid: r.uuid, name: r.name, aindex: r.aindex })));
        }
        res.json(rows);
    });
});

module.exports = {
    router,
    setDatabase
};
