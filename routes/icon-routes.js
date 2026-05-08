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
    
    let sql = 'SELECT * FROM A7001 WHERE isdel = ?';
    const params = ['0'];
    
    if (categoryUuid !== undefined && categoryUuid !== null) {
        sql += ' AND a70Id = ?';
        params.push(parseInt(categoryUuid));
    }
    
    sql += ' ORDER BY uuid ASC';
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 创建新图标
router.post('/', (req, res) => {
    const { name, target, bgimage, category_id } = req.body;
    
    if (!name || !target || !category_id) {
        res.status(400).json({ error: '缺少必要参数' });
        return;
    }
    
    // 生成 UUID
    const uuid = require('crypto').randomUUID();
    
    // 插入 A7001 表
    const insertSql = 'INSERT INTO A7001 (uuid, a70Id, name, target, bgimage, isdel) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(insertSql, [uuid, parseInt(category_id), name, target, bgimage || null, '0'], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // 同时创建布局记录（默认位置）
        const layoutSql = 'INSERT INTO item_layouts (item_uuid, category_id, pos_x, pos_y, width, height) VALUES (?, ?, 0, 0, 1, 1)';
        db.run(layoutSql, [uuid, parseInt(category_id)], function(layoutErr) {
            if (layoutErr) {
                // 静默处理布局记录创建失败
            }
            
            res.json({ 
                success: true, 
                uuid,
                message: '图标创建成功'
            });
        });
    });
});

// 创建小组件（特殊类型的图标）
router.post('/widget', (req, res) => {
    const { widget_type, category_id } = req.body;
    
    if (!widget_type || !category_id) {
        res.status(400).json({ error: '缺少必要参数' });
        return;
    }
    
    // 生成 UUID
    const uuid = require('crypto').randomUUID();
    
    // 小组件名称映射
    const widgetNames = {
        'clock': '时钟',
        'calendar': '日历',
        'weather': '天气'
    };
    
    const name = widgetNames[widget_type] || widget_type;
    
    // 插入 A7001 表（小组件是特殊的图标，target 为空）
    const insertSql = 'INSERT INTO A7001 (uuid, a70Id, name, target, bgimage, isdel) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(insertSql, [uuid, parseInt(category_id), name, null, null, '0'], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // 创建布局记录（默认位置，大小为 2x2）
        const layoutSql = 'INSERT INTO item_layouts (item_uuid, category_id, pos_x, pos_y, width, height) VALUES (?, ?, 0, 0, 2, 2)';
        db.run(layoutSql, [uuid, parseInt(category_id)], function(layoutErr) {
            if (layoutErr) {
                // 静默处理布局记录创建失败
            }
            
            res.json({ 
                success: true, 
                uuid,
                widget_type,
                message: '小组件创建成功'
            });
        });
    });
});

// 更新图标布局（位置和大小）
router.put('/layout', (req, res) => {
    const { item_uuid, category_id, pos_x, pos_y, width, height } = req.body;
    
    // 先检查是否已存在布局记录
    const checkSql = 'SELECT * FROM item_layouts WHERE item_uuid = ? AND category_id = ?';
    db.get(checkSql, [item_uuid, category_id], (err, row) => {
        if (err) {
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
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true, id: this.lastID });
        });
    });
});

// 批量更新图标排序
router.put('/reorder', (req, res) => {
    const { items } = req.body; // [{ item_uuid, category_id, sort_order }, ...]
    const promises = [];
    
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
            res.json({ success: true });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

// 移动图标到另一个分类（更新 a70Id）
router.put('/move', (req, res) => {
    const { item_uuid, new_category_id } = req.body;
    
    const sql = 'UPDATE A7001 SET a70Id = ? WHERE uuid = ?';
    db.run(sql, [new_category_id, item_uuid], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, changes: this.changes });
    });
});

// 删除图标（软删除）
router.delete('/:uuid', (req, res) => {
    const { uuid } = req.params;
    
    // 软删除：更新 isdel 字段
    const sql = 'UPDATE A7001 SET isdel = ?, delDatetime = CURRENT_TIMESTAMP WHERE uuid = ?';
    db.run(sql, ['1', uuid], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: '图标不存在' });
            return;
        }
        
        res.json({ success: true, changes: this.changes });
    });
});

// 更新图标信息（名称、链接、图片）
router.put('/:uuid', (req, res) => {
    const { uuid } = req.params;
    const { name, target, bgimage } = req.body;
    
    // 构建动态 SQL
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
    }
    if (target !== undefined) {
        updates.push('target = ?');
        params.push(target);
    }
    if (bgimage !== undefined) {
        updates.push('bgimage = ?');
        params.push(bgimage);
    }
    
    if (updates.length === 0) {
        res.status(400).json({ error: '没有提供要更新的字段' });
        return;
    }
    
    updates.push('upDatetime = CURRENT_TIMESTAMP');
    params.push(uuid);
    
    const sql = `UPDATE A7001 SET ${updates.join(', ')} WHERE uuid = ?`;
    
    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: '图标不存在' });
            return;
        }
        
        res.json({ success: true, changes: this.changes });
    });
});

module.exports = {
    router,
    setDatabase
};
