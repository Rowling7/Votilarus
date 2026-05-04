const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

// 获取所有设置
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM stettings WHERE isdel = ?';
    db.all(sql, ['0'], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // 转换为键值对格式
        const settings = {};
        rows.forEach(row => {
            settings[row.key] = row.value;
        });
        
        res.json(settings);
    });
});

// 更新设置
router.put('/', (req, res) => {
    const updates = req.body;
    const promises = [];
    
    for (const [key, value] of Object.entries(updates)) {
        const promise = new Promise((resolve, reject) => {
            const sql = 'UPDATE stettings SET value = ? WHERE key = ?';
            db.run(sql, [value, key], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
        promises.push(promise);
    }
    
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
