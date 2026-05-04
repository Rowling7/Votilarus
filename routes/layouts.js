const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

// 获取图标的布局信息
router.get('/', (req, res) => {
    const itemUuid = req.query.item_uuid;
    
    let sql = 'SELECT * FROM item_layouts WHERE is_active = ?';
    const params = ['1'];
    
    if (itemUuid) {
        sql += ' AND item_uuid = ?';
        params.push(itemUuid);
    }
    
    db.all(sql, params, (err, rows) => {
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
