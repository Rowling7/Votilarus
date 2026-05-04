const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, 'data', 'Votilarus.db');

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 数据库连接
let db;

function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('数据库连接失败:', err.message);
                reject(err);
            } else {
                console.log('已连接到 SQLite 数据库');
                resolve();
            }
        });
    });
}

// ==================== API 路由 ====================

// 获取所有分类
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT * FROM A70 WHERE isdel = ? ORDER BY aindex ASC';
    db.all(sql, ['0'], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 获取分类下的图标
app.get('/api/items', (req, res) => {
    const categoryUuid = req.query.category_uuid;
    
    let sql = 'SELECT * FROM A7001 WHERE isdel = ?';
    const params = ['0'];
    
    if (categoryUuid) {
        sql += ' AND a70Id = ?';
        params.push(categoryUuid);
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

// 获取图标的布局信息
app.get('/api/layout', (req, res) => {
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

// 获取 Dock 栏项
app.get('/api/dock', (req, res) => {
    const sql = 'SELECT d.*, i.name, i.target, i.bgimage FROM dock_items d JOIN A7001 i ON d.item_uuid = i.uuid ORDER BY d.sort_order ASC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 获取所有设置
app.get('/api/settings', (req, res) => {
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
app.put('/api/settings', (req, res) => {
    const updates = req.body;
    const promises = [];
    
    for (const [key, value] of Object.entries(updates)) {
        const promise = new Promise((resolve, reject) => {
            const sql = 'UPDATE stettings SET value = ? WHERE key = ?';
            db.run(sql, [value, key], function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
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

// SPA 路由回退
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
async function startServer() {
    try {
        await initDatabase();
        app.listen(PORT, () => {
            console.log(`服务器运行在 http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('服务器启动失败:', err);
        process.exit(1);
    }
}

startServer();
