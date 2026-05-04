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
            // 先尝试更新，如果没有影响行数，则插入
            const updateSql = 'UPDATE stettings SET value = ? WHERE key = ?';
            db.run(updateSql, [value, key], function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                
                // 如果没有更新任何行，说明 key 不存在，需要插入
                if (this.changes === 0) {
                    const insertSql = 'INSERT INTO stettings (key, value, type, isdisplay, isdel) VALUES (?, ?, ?, ?, ?)';
                    db.run(insertSql, [key, value, 'personal', '1', '0'], function(insertErr) {
                        if (insertErr) reject(insertErr);
                        else resolve({ changes: 1, inserted: true });
                    });
                } else {
                    resolve({ changes: this.changes, inserted: false });
                }
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
