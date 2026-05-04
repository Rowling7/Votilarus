const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

// 获取分类下的图标
router.get('/', (req, res) => {
    const categoryUuid = req.query.category_uuid;
    
    console.log('🔍 [API] 请求图标列表');
    console.log('  - category_uuid 参数:', categoryUuid);
    console.log('  - 参数类型:', typeof categoryUuid);
    
    let sql = 'SELECT * FROM A7001 WHERE isdel = ?';
    const params = ['0'];
    
    if (categoryUuid !== undefined && categoryUuid !== null) {
        sql += ' AND a70Id = ?';
        const convertedUuid = parseInt(categoryUuid);
        console.log('  - 转换后的 a70Id:', convertedUuid);
        console.log('  - 转换类型:', typeof convertedUuid);
        params.push(convertedUuid);
    } else {
        console.log('  - ⚠️ 未提供 category_uuid，返回所有图标');
    }
    
    console.log('  - SQL 查询:', sql);
    console.log('  - 参数:', params);
    
    sql += ' ORDER BY uuid ASC';
    console.log('  - 最终 SQL:', sql);
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('  - ❌ 查询错误:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        console.log('  - ✅ 查询结果数量:', rows.length);
        if (rows.length > 0) {
            console.log('  - 第一条记录:', {
                uuid: rows[0].uuid,
                a70Id: rows[0].a70Id,
                name: rows[0].name
            });
        }
        res.json(rows);
    });
});

// 更新图标布局（位置和大小）
router.put('/layout', (req, res) => {
    const { item_uuid, category_id, pos_x, pos_y, width, height } = req.body;
    
    console.log('🔄 [API] 更新图标布局:', { item_uuid, category_id, pos_x, pos_y, width, height });
    
    // 先检查是否已存在布局记录
    const checkSql = 'SELECT * FROM item_layouts WHERE item_uuid = ? AND category_id = ?';
    db.get(checkSql, [item_uuid, category_id], (err, row) => {
        if (err) {
            console.error('  - ❌ 查询错误:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        
        let sql;
        let params;
        
        if (row) {
            // 更新现有记录
            sql = 'UPDATE item_layouts SET pos_x = ?, pos_y = ?, width = ?, height = ?, updated_at = CURRENT_TIMESTAMP WHERE item_uuid = ? AND category_id = ?';
            params = [pos_x, pos_y, width, height, item_uuid, category_id];
        } else {
            // 插入新记录
            sql = 'INSERT INTO item_layouts (item_uuid, category_id, pos_x, pos_y, width, height) VALUES (?, ?, ?, ?, ?, ?)';
            params = [item_uuid, category_id, pos_x, pos_y, width, height];
        }
        
        db.run(sql, params, function(err) {
            if (err) {
                console.error('  - ❌ 更新错误:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            console.log('  - ✅ 布局更新成功');
            res.json({ success: true, id: this.lastID });
        });
    });
});

// 批量更新图标排序
router.put('/reorder', (req, res) => {
    const { items } = req.body; // [{ item_uuid, category_id, sort_order }, ...]
    const promises = [];
    
    console.log('🔄 [API] 批量更新图标排序:', items.length, '个图标');
    
    items.forEach(item => {
        const promise = new Promise((resolve, reject) => {
            const sql = 'UPDATE item_layouts SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE item_uuid = ? AND category_id = ?';
            db.run(sql, [item.sort_order, item.item_uuid, item.category_id], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
        promises.push(promise);
    });
    
    Promise.all(promises)
        .then(() => {
            console.log('  - ✅ 排序更新成功');
            res.json({ success: true });
        })
        .catch(err => {
            console.error('  - ❌ 排序更新失败:', err.message);
            res.status(500).json({ error: err.message });
        });
});

module.exports = {
    router,
    setDatabase
};
