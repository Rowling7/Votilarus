const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

// 获取组件列表
router.get('/', (req, res) => {
    const categoryId = req.query.category_id;

    let sql = 'SELECT * FROM icon_widgets WHERE deleted_flag = ?';
    const params = ['0'];

    if (categoryId !== undefined && categoryId !== null) {
        sql += ' AND category_id = ?';
        params.push(parseInt(categoryId));
    }

    sql += ' ORDER BY sort_order ASC, id ASC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 创建新组件
router.post('/', (req, res) => {
    const { title, category_id, width, height, active_flag } = req.body;



    if (!title || !category_id) {
        console.error('缺少必要参数:', { title, category_id });
        res.status(400).json({ error: '缺少必要参数' });
        return;
    }

    const insertSql = `INSERT INTO icon_widgets 
        (category_id, sort_order, title, width, height, active_flag, deleted_flag, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;

    const params = [
        parseInt(category_id),
        0,
        title,
        width || 2,
        height || 2,
        active_flag !== undefined ? active_flag : 1,
        '0'
    ];



    db.run(insertSql, params, function (err) {
        if (err) {
            console.error('数据库插入错误:', err);
            res.status(500).json({ error: err.message });
            return;
        }


        res.json({
            success: true,
            widgetId: this.lastID,
            message: '组件创建成功'
        });
    });
});

// 更新组件布局（位置、尺寸）
router.put('/:id/layout', (req, res) => {
    const { id } = req.params;
    const { pos_x, pos_y, width, height } = req.body;

    const updates = [];
    const params = [];

    if (pos_x !== undefined) {
        updates.push('pos_x = ?');
        params.push(pos_x);
    }
    if (pos_y !== undefined) {
        updates.push('pos_y = ?');
        params.push(pos_y);
    }
    if (width !== undefined) {
        updates.push('width = ?');
        params.push(width);
    }
    if (height !== undefined) {
        updates.push('height = ?');
        params.push(height);
    }

    if (updates.length === 0) {
        res.status(400).json({ error: '没有提供要更新的字段' });
        return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const sql = `UPDATE icon_widgets SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: '组件不存在' });
            return;
        }

        res.json({ success: true, changes: this.changes });
    });
});

// 批量更新组件排序
router.put('/reorder', (req, res) => {
    const { widgets } = req.body; // [{ widget_id, category_id, sort_order }, ...]
    const promises = [];

    widgets.forEach(widget => {
        const promise = new Promise((resolve, reject) => {
            const sql = 'UPDATE icon_widgets SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND category_id = ?';
            db.run(sql, [widget.sort_order, widget.widget_id, widget.category_id], function (err) {
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

// 删除组件（软删除）
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'UPDATE icon_widgets SET deleted_flag = ?, deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
    db.run(sql, ['1', id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: '组件不存在' });
            return;
        }

        res.json({ success: true, changes: this.changes });
    });
});

// 更新组件信息
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, title_cn, active_flag } = req.body;

    const updates = [];
    const params = [];

    if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
    }
    if (title_cn !== undefined) {
        updates.push('title_cn = ?');
        params.push(title_cn);
    }
    if (active_flag !== undefined) {
        updates.push('active_flag = ?');
        params.push(active_flag);
    }

    if (updates.length === 0) {
        res.status(400).json({
            success: false,
            error: '没有提供要更新的字段'
        });
        return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const sql = `UPDATE icon_widgets SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({
                success: false,
                error: err.message
            });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({
                success: false,
                error: '组件不存在'
            });
            return;
        }

        res.json({
            success: true,
            data: { changes: this.changes }
        });
    });
});

module.exports = {
    router,
    setDatabase
};
