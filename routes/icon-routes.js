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

    // 按 sort_order 排序，如果没有设置则按 id 排序
    sql += ' ORDER BY COALESCE(sort_order, 999999) ASC, id ASC';

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

    // 计算当前分类下的最大 sort_order
    const maxOrderSql = 'SELECT MAX(sort_order) as max_order FROM icon_items WHERE category_id = ? AND deleted_flag = ?';
    db.get(maxOrderSql, [parseInt(category_id), '0'], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // 自动递增：最大值 + 1，如果没有记录则从 0 开始
        const sortOrder = row && row.max_order !== null ? row.max_order + 1 : 0;

        // 插入 icon_items 表（包含 sort_order、width、height）
        const insertSql = 'INSERT INTO icon_items (category_id, title, link_url, icon_path, sort_order, width, height, deleted_flag) VALUES (?, ?, ?, ?, ?, 1, 1, ?)';
        db.run(insertSql, [parseInt(category_id), name, target, bgimage || null, sortOrder, '0'], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            res.json({
                success: true,
                itemId: this.lastID,
                sortOrder: sortOrder,
                message: '图标创建成功'
            });
        });
    });
});

// 创建小组件（特殊类型的图标）- 已废弃，请使用 /api/widgets
// router.post('/widget', (req, res) => {
//     const { widget_type, category_id } = req.body;
//
//     if (!widget_type || !category_id) {
//         res.status(400).json({ error: '缺少必要参数' });
//         return;
//     }
//
//     // 生成 UUID
//     const uuid = require('crypto').randomUUID();
//
//     // 小组件名称和默认大小映射
//     const widgetConfigs = {
//         'clock': { name: 'ClockWidget', width: 2, height: 2 },
//         'calendar': { name: 'CalendarWidget', width: 2, height: 2 },
//         'weather': { name: 'WeatherWidget', width: 2, height: 4 }
//     };
//
//     const config = widgetConfigs[widget_type] || { name: widget_type, width: 2, height: 2 };
//     const name = config.name;
//     const width = config.width;
//     const height = config.height;
//
//     // 插入 icon_items 表（小组件是特殊的图标，link_url 为空）
//     const insertSql = 'INSERT INTO icon_items (category_id, title, link_url, icon_path, deleted_flag) VALUES (?, ?, ?, ?, ?)';
//     db.run(insertSql, [parseInt(category_id), name, null, null, '0'], function (err) {
//         if (err) {
//             res.status(500).json({ error: err.message });
//             return;
//         }
//
//         // 创建布局记录（根据widget类型设置默认大小）
//         const layoutSql = 'INSERT INTO item_layouts (item_id, category_id, pos_x, pos_y, width, height) VALUES (?, ?, 0, 0, ?, ?)';
//         db.run(layoutSql, [this.lastID, parseInt(category_id), width, height], function (layoutErr) {
//             if (layoutErr) {
//                 // 静默处理布局记录创建失败
//             }
//
//             res.json({
//                 success: true,
//                 itemId: this.lastID,
//                 widget_type,
//                 message: '小组件创建成功'
//             });
//         });
//     });
// });

// 更新图标布局（位置和大小）- 现在直接更新 icon_items 表
router.put('/layout', (req, res) => {
    const { item_id, category_id, pos_x, pos_y, width, height } = req.body;

    // 构建动态更新语句
    const updates = [];
    const params = [];

    if (width !== undefined) {
        updates.push('width = ?');
        params.push(parseInt(width));
    }
    if (height !== undefined) {
        updates.push('height = ?');
        params.push(parseInt(height));
    }

    if (updates.length === 0) {
        res.status(400).json({ error: '没有提供要更新的字段' });
        return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(item_id);

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

// 批量更新图标排序
router.put('/reorder', (req, res) => {
    const { items } = req.body;
    const promises = [];

    items.forEach(item => {
        const promise = new Promise((resolve, reject) => {
            const sql = 'UPDATE icon_items SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            db.run(sql, [item.sort_order, item.item_id], function (err) {
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
    const { item_id, new_category_id } = req.body;

    if (!item_id || !new_category_id) {
        res.status(400).json({ error: '缺少必要参数' });
        return;
    }

    const sql = 'UPDATE icon_items SET category_id = ? WHERE id = ?';
    db.run(sql, [new_category_id, item_id], function (err) {
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

// 更新图标信息（名称、链接、图片、分类）
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, target, bgimage, category_id } = req.body;

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
    if (category_id !== undefined && category_id !== null) {
        updates.push('category_id = ?');
        params.push(parseInt(category_id));
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

// 搜索图标（模糊搜索名称和链接）
router.get('/search', (req, res) => {
    const { q } = req.query;

    if (!q || q.trim() === '') {
        res.json([]);
        return;
    }

    const searchTerm = `%${q.trim()}%`;
    const sql = `
        SELECT * FROM icon_items 
        WHERE deleted_flag = ? 
        AND (title LIKE ? OR link_url LIKE ?)
        ORDER BY COALESCE(sort_order, 999999) ASC, id ASC
    `;

    db.all(sql, ['0', searchTerm, searchTerm], (err, rows) => {
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
