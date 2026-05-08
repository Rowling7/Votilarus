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

    let sql = 'SELECT * FROM icon_items WHERE deleted_flag = ?';
    const params = ['0'];

    if (categoryUuid !== undefined && categoryUuid !== null) {
        sql += ' AND category_id = ?';
        params.push(parseInt(categoryUuid));
    }

    sql += ' ORDER BY id ASC';

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

    // 插入 icon_items 表
    const insertSql = 'INSERT INTO icon_items (category_id, title, link_url, icon_path, deleted_flag) VALUES (?, ?, ?, ?, ?)';
    db.run(insertSql, [parseInt(category_id), name, target, bgimage || null, '0'], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // 同时创建布局记录（默认位置）
        const layoutSql = 'INSERT INTO item_layouts (item_id, category_id, pos_x, pos_y, width, height) VALUES (?, ?, 0, 0, 1, 1)';
        db.run(layoutSql, [this.lastID, parseInt(category_id)], function (layoutErr) {
            if (layoutErr) {
                // 静默处理布局记录创建失败
            }

            res.json({
                success: true,
                itemId: this.lastID,
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

    // 插入 icon_items 表（小组件是特殊的图标，link_url 为空）
    const insertSql = 'INSERT INTO icon_items (category_id, title, link_url, icon_path, deleted_flag) VALUES (?, ?, ?, ?, ?)';
    db.run(insertSql, [parseInt(category_id), name, null, null, '0'], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // 创建布局记录（默认位置，大小为 2x2）
        const layoutSql = 'INSERT INTO item_layouts (item_id, category_id, pos_x, pos_y, width, height) VALUES (?, ?, 0, 0, 2, 2)';
        db.run(layoutSql, [this.lastID, parseInt(category_id)], function (layoutErr) {
            if (layoutErr) {
                // 静默处理布局记录创建失败
            }

            res.json({
                success: true,
                itemId: this.lastID,
                widget_type,
                message: '小组件创建成功'
            });
        });
    });
});

// 更新图标布局（位置和大小）
router.put('/layout', (req, res) => {
    const { item_id, category_id, pos_x, pos_y, width, height } = req.body;

    // 先检查是否已存在布局记录
    const checkSql = 'SELECT * FROM item_layouts WHERE item_id = ? AND category_id = ?';
    db.get(checkSql, [item_id, category_id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        let sql;
        let params;

        if (row) {
            // 更新现有记录
            sql = 'UPDATE item_layouts SET pos_x = ?, pos_y = ?, width = ?, height = ?, updated_at = CURRENT_TIMESTAMP WHERE item_id = ? AND category_id = ?';
            params = [pos_x, pos_y, width, height, item_id, category_id];
        } else {
            // 插入新记录
            sql = 'INSERT INTO item_layouts (item_id, category_id, pos_x, pos_y, width, height) VALUES (?, ?, ?, ?, ?, ?)';
            params = [item_id, category_id, pos_x, pos_y, width, height];
        }

        db.run(sql, params, function (err) {
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
    const { items } = req.body; // [{ item_id, category_id, sort_order }, ...]
    const promises = [];

    items.forEach(item => {
        const promise = new Promise((resolve, reject) => {
            const sql = 'UPDATE item_layouts SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE item_id = ? AND category_id = ?';
            db.run(sql, [item.sort_order, item.item_id, item.category_id], function (err) {
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

// 移动图标到另一个分类（更新 category_id）
router.put('/move', (req, res) => {
    const { itemId, new_category_id } = req.body;

    const sql = 'UPDATE icon_items SET category_id = ? WHERE id = ?';
    db.run(sql, [new_category_id, itemId], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, changes: this.changes });
    });
});

// 删除图标（软删除）
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    // 软删除：更新 deleted_flag 字段
    const sql = 'UPDATE icon_items SET deleted_flag = ?, deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
    db.run(sql, ['1', id], function (err) {
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
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, target, bgimage } = req.body;

    // 构建动态 SQL
    const updates = [];
    const params = [];

    if (name !== undefined) {
        updates.push('title = ?');
        params.push(name);
    }
    if (target !== undefined) {
        updates.push('link_url = ?');
        params.push(target);
    }
    if (bgimage !== undefined) {
        updates.push('icon_path = ?');
        params.push(bgimage);
    }

    if (updates.length === 0) {
        res.status(400).json({ error: '没有提供要更新的字段' });
        return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const sql = `UPDATE icon_items SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, params, function (err) {
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
