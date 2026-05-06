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
    const sql = 'SELECT * FROM settings WHERE isdel = ? and type = ?';
    db.all(sql, ['0', 'personal'], (err, rows) => {
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
            const updateSql = 'UPDATE settings SET value = ? WHERE key = ?';
            db.run(updateSql, [value, key], function (err) {
                if (err) {
                    reject(err);
                    return;
                }

                // 如果没有更新任何行，说明 key 不存在，需要插入
                if (this.changes === 0) {
                    const insertSql = 'INSERT INTO settings (key, value, type, isdisplay, isdel) VALUES (?, ?, ?, ?, ?)';
                    db.run(insertSql, [key, value, 'personal', '1', '0'], function (insertErr) {
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

// 导出所有设置（JSON格式）
router.get('/export', (req, res) => {
    const sql = 'SELECT * FROM settings WHERE isdel = ?';
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

        // 添加元数据
        const exportData = {
            version: '1.0',
            exportTime: new Date().toISOString(),
            settings: settings
        };

        res.json(exportData);
    });
});

// 导入设置（JSON格式）
router.post('/import', (req, res) => {
    const importData = req.body;

    if (!importData.settings || typeof importData.settings !== 'object') {
        res.status(400).json({ error: '无效的设置数据' });
        return;
    }

    const settings = importData.settings;
    const promises = [];

    for (const [key, value] of Object.entries(settings)) {
        const promise = new Promise((resolve, reject) => {
            const updateSql = 'UPDATE settings SET value = ? WHERE key = ?';
            db.run(updateSql, [value.toString(), key], function (err) {
                if (err) {
                    reject(err);
                    return;
                }

                // 如果没有更新任何行，说明 key 不存在，需要插入
                if (this.changes === 0) {
                    const insertSql = 'INSERT INTO settings (key, value, type, isdisplay, isdel) VALUES (?, ?, ?, ?, ?)';
                    db.run(insertSql, [key, value.toString(), 'personal', '1', '0'], function (insertErr) {
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
        .then(results => {
            res.json({ success: true, count: results.length });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

// 恢复默认设置
router.post('/reset', (req, res) => {
    // 默认设置 - 使用数据库中已存在的字段名
    const defaultSettings = {
        grid_cols: '13',
        grid_rows: '5',
        cell_gap: '2',
        sidebar_width: '4',
        theme_mode: 'dark',
        theme_color: '#667eea',
        bg_image_url: 'static/background/image061.png',
        bg_blur: '5',
        bg_opacity: '0',
        overlay_color: '#ffffff',
        overlay_opacity: '0.3',
        icon_radius: '0.5',
        icon_shadow: '1',
        icon_hover_effect: 'scale',
        show_title: '1',
        title_position: 'bottom',
        title_font_size: '12',
        title_font_color: '#ffffff',
        title_max_length: '8',
        tooltip_delay: '300',
        dock_position: 'bottom',
        dock_max_icons: '10',
        dock_blur: '10',
        dock_opacity: '0.3',
        fisheye_scale: '1.5',
        fisheye_range: '2',
        search_engine: 'baidu',
        search_box_position: 'center',
        search_box_style: 'rounded',
        scroll_animation_speed: '300',
        drag_sensitivity: '5',
        enable_context_menu: '1',
        darkmode: '1'
    };

    const promises = [];

    for (const [key, value] of Object.entries(defaultSettings)) {
        const promise = new Promise((resolve, reject) => {
            const updateSql = 'UPDATE settings SET value = ? WHERE key = ?';
            db.run(updateSql, [value, key], function (err) {
                if (err) {
                    reject(err);
                    return;
                }

                if (this.changes === 0) {
                    const insertSql = 'INSERT INTO settings (key, value, type, isdisplay, isdel) VALUES (?, ?, ?, ?, ?)';
                    db.run(insertSql, [key, value, 'personal', '1', '0'], function (insertErr) {
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
        .then(results => {
            res.json({ success: true, count: results.length });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

// 获取单个设置项
router.get('/:key', (req, res) => {
    const key = req.params.key;
    const sql = 'SELECT value FROM settings WHERE key = ? AND isdel = ?';

    db.get(sql, [key, '0'], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (row) {
            res.json({ value: row.value });
        } else {
            res.status(404).json({ error: 'Setting not found' });
        }
    });
});

// 批量获取设置项
router.post('/batch', (req, res) => {
    const keys = req.body.keys || [];
    if (!Array.isArray(keys) || keys.length === 0) {
        return res.status(400).json({ error: 'Keys array is required' });
    }

    const placeholders = keys.map(() => '?').join(',');
    const sql = `SELECT key, value FROM settings WHERE key IN (${placeholders}) AND isdel = ?`;
    const params = [...keys, '0'];

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const settings = {};
        rows.forEach(row => {
            settings[row.key] = row.value;
        });

        res.json(settings);
    });
});

module.exports = {
    router,
    setDatabase
};