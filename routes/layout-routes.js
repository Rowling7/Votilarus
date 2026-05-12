const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

// 获取所有布局（默认路由）- 现在从 icon_items 表获取
router.get('/', (req, res) => {
    const sql = 'SELECT id as item_id, category_id, width, height, sort_order FROM icon_items WHERE deleted_flag = ? ORDER BY category_id, COALESCE(sort_order, 999999) ASC';

    db.all(sql, ['0'], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 获取网格配置
router.get('/grid', (req, res) => {
    const sql = `
        SELECT 
            (SELECT value FROM settings WHERE key = 'grid_cols' AND isdel = '0') as columns,
            (SELECT value FROM settings WHERE key = 'grid_rows' AND isdel = '0') as rows,
            (SELECT value FROM settings WHERE key = 'cell_base_size' AND isdel = '0') as cell_base_size,
            (SELECT value FROM settings WHERE key = 'cell_gap' AND isdel = '0') as cell_gap
    `;

    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // 返回默认值
        const config = {
            columns: parseInt(row?.columns) || 13,
            rows: parseInt(row?.rows) || 5,
            cell_base_size: parseFloat(row?.cell_base_size) || 4,
            cell_gap: parseFloat(row?.cell_gap) || 2
        };

        res.json(config);
    });
});

// 更新网格配置
router.put('/grid', (req, res) => {
    const { columns, rows, cell_base_size, cell_gap } = req.body;

    const updates = [];

    if (columns !== undefined) {
        updates.push({ key: 'grid_cols', value: columns.toString() });
    }
    if (rows !== undefined) {
        updates.push({ key: 'grid_rows', value: rows.toString() });
    }
    if (cell_base_size !== undefined) {
        updates.push({ key: 'cell_base_size', value: cell_base_size.toString() });
    }
    if (cell_gap !== undefined) {
        updates.push({ key: 'cell_gap', value: cell_gap.toString() });
    }

    if (updates.length === 0) {
        res.status(400).json({ error: '没有提供要更新的字段' });
        return;
    }

    // 批量更新设置
    const promises = updates.map(update => {
        return new Promise((resolve, reject) => {
            // 先检查是否存在
            const checkSql = 'SELECT * FROM settings WHERE key = ?';
            db.get(checkSql, [update.key], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                let sql;
                let params;

                if (row) {
                    // 更新现有记录
                    sql = 'UPDATE settings SET value = ?, upDatetime = CURRENT_TIMESTAMP WHERE key = ?';
                    params = [update.value, update.key];
                } else {
                    // 插入新记录
                    sql = 'INSERT INTO settings (key, value, type, isdel) VALUES (?, ?, \'global\', \'0\')';
                    params = [update.key, update.value];
                }

                db.run(sql, params, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ key: update.key, changes: this.changes });
                    }
                });
            });
        });
    });

    Promise.all(promises)
        .then(results => {
            res.json({ success: true, results });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

// 获取图标的布局信息 - 现在从 icon_items 表获取
router.get('/item/:uuid', (req, res) => {
    const { uuid } = req.params;

    const sql = 'SELECT width, height, sort_order FROM icon_items WHERE id = ? AND deleted_flag = ?';
    const params = [uuid, '0'];

    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!row) {
            // 返回默认布局
            res.json({
                width: 1,
                height: 1,
                sort_order: 0
            });
            return;
        }

        res.json({
            width: row.width || 1,
            height: row.height || 1,
            sort_order: row.sort_order !== null ? row.sort_order : 0
        });
    });
});

// 批量获取分类下所有图标的布局 - 现在从 icon_items 表获取
router.get('/category/:categoryId', (req, res) => {
    const { categoryId } = req.params;

    const sql = `
        SELECT 
            i.id as item_id,
            i.category_id,
            i.title,
            i.link_url,
            i.icon_path,
            i.width,
            i.height,
            i.sort_order
        FROM icon_items i
        WHERE i.category_id = ? AND i.deleted_flag = '0'
        ORDER BY COALESCE(i.sort_order, 999999) ASC
    `;

    db.all(sql, [parseInt(categoryId)], (err, rows) => {
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
