const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const registerRoutes = require('./routes');

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

// SPA 路由回退（必须在所有 API 路由之后）
// 只匹配非 API 路径
app.use((req, res, next) => {
    if (!req.path.startsWith('/api/') && !req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        next();
    }
});

// 启动服务器
async function startServer() {
    try {
        await initDatabase();
        
        // ==================== API 路由 ====================
        // 注册所有 API 路由（在数据库连接后）
        registerRoutes(app, db);
        
        app.listen(PORT, () => {
            console.log(`服务器运行在 http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('服务器启动失败:', err);
        process.exit(1);
    }
}

startServer();
