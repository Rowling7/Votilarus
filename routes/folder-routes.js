const express = require('express');
const router = express.Router();

let db;

function setDatabase(database) {
    db = database;
}

/**
 * GET /api/folder/:widgetId/items
 * 获取文件夹内所有图标（过滤已删除的图标）
 */
router.get('/:widgetId/items', (req, res) => {
    const { widgetId } = req.params;
    console.log(`[FolderRoutes] GET /api/folder/${widgetId}/items`);

    const sql = `
        SELECT
            fwi.id AS folder_item_id,
            fwi.sort_order,
            fwi.created_at,
            ii.id AS item_id,
            ii.title,
            ii.link_url,
            ii.icon_path,
            ii.category_id
        FROM folder_widget_items fwi
        LEFT JOIN icon_items ii ON fwi.item_id = ii.id AND ii.deleted_flag = '0'
        WHERE fwi.folder_widget_id = ?
        ORDER BY fwi.sort_order ASC, fwi.id ASC
    `;

    db.all(sql, [parseInt(widgetId)], (err, rows) => {
        if (err) {
            console.error(`[FolderRoutes] 查询失败:`, err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        // 过滤掉已删除图标（ii.id 为 NULL 的）
        const validRows = rows.filter(row => row.item_id !== null);
        console.log(`[FolderRoutes] 返回 ${validRows.length} 个图标 (总行数: ${rows.length})`, JSON.stringify(validRows.map(r => ({ item_id: r.item_id, title: r.title }))));
        res.json(validRows);
    });
});

/**
 * POST /api/folder/:widgetId/add-item
 * 添加图标到文件夹
 * Body: { item_id: number }
 */
router.post('/:widgetId/add-item', (req, res) => {
    const { widgetId } = req.params;
    const { item_id } = req.body;
    console.log(`[FolderRoutes] POST /api/folder/${widgetId}/add-item, body:`, req.body);

    if (!item_id) {
        res.status(400).json({ error: '缺少 item_id 参数' });
        return;
    }

    // 检查是否已存在于该文件夹中
    const checkSql = 'SELECT id FROM folder_widget_items WHERE folder_widget_id = ? AND item_id = ?';
    db.get(checkSql, [parseInt(widgetId), parseInt(item_id)], (err, existing) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (existing) {
            res.status(409).json({ error: '该图标已在文件夹中' });
            return;
        }

        // 获取当前最大 sort_order
        const maxSql = 'SELECT MAX(sort_order) AS max_order FROM folder_widget_items WHERE folder_widget_id = ?';
        db.get(maxSql, [parseInt(widgetId)], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            const nextOrder = (row && row.max_order !== null) ? row.max_order + 1 : 0;

            const insertSql = `
                INSERT INTO folder_widget_items (folder_widget_id, item_id, sort_order, created_at)
                VALUES (?, ?, ?, datetime('now'))
            `;

            db.run(insertSql, [parseInt(widgetId), parseInt(item_id), nextOrder], function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                res.json({
                    success: true,
                    id: this.lastID,
                    message: '图标已添加到文件夹'
                });
            });
        });
    });
});

/**
 * DELETE /api/folder/:widgetId/remove-item/:itemId
 * 从文件夹中移除图标
 */
router.delete('/:widgetId/remove-item/:itemId', (req, res) => {
    const { widgetId, itemId } = req.params;
    console.log(`[FolderRoutes] DELETE /api/folder/${widgetId}/remove-item/${itemId}`);

    const sql = 'DELETE FROM folder_widget_items WHERE folder_widget_id = ? AND item_id = ?';
    db.run(sql, [parseInt(widgetId), parseInt(itemId)], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: '未找到该图标' });
            return;
        }

        res.json({
            success: true,
            message: '图标已从文件夹移除'
        });
    });
});

/**
 * POST /api/folder/:widgetId/reorder
 * 更新图标排序
 * Body: { items: [{ id: number, sort_order: number }, ...] }
 */
router.post('/:widgetId/reorder', (req, res) => {
    const { widgetId } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
        res.status(400).json({ error: '缺少 items 数组' });
        return;
    }

    const promises = items.map(item => {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE folder_widget_items SET sort_order = ? WHERE id = ? AND folder_widget_id = ?';
            db.run(sql, [item.sort_order, item.id, parseInt(widgetId)], function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    });

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
