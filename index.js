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

// 数据库连接
let db;

function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// 初始化数据库表和默认设置
async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // 确保settings表存在
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE,
                value TEXT,
                type TEXT,
                notes TEXT,
                isdisplay TEXT,
                isdel TEXT DEFAULT '0'
            )
        `;

        db.run(createTableSQL, [], (err) => {
            if (err) {
                console.error("Error creating settings table:", err);
                reject(err);
                return;
            }

            // 不再插入默认值，因为数据库已经包含这些设置
            // 只是确保数据库结构正确
            resolve();
        });
    });
}

async function startServer() {
    try {
        await initDatabase();
        await initializeDatabase(); // 初始化数据库和默认设置

        // ==================== API 路由 ====================
        // 注册所有 API 路由（在数据库连接后，SPA 回退之前）
        registerRoutes(app, db);

        // 静态文件服务 - data 目录（专门处理 SVG 等文件）
        app.use('/data', (req, res, next) => {
            const fs = require('fs');
            // req.path 已经去掉了 /data 前缀，例如: /category/network.svg
            const filePath = path.join(__dirname, 'data', req.path);

            // 检查文件是否存在
            if (!fs.existsSync(filePath)) {
                return next();
            }

            // 为 SVG 文件设置正确的 MIME 类型
            if (filePath.endsWith('.svg')) {
                res.set('Content-Type', 'image/svg+xml');
            }

            res.sendFile(filePath);
        });

        // 静态文件服务 - public 目录
        app.use(express.static(path.join(__dirname, 'public')));

        // SPA 路由回退（必须在最后）
        app.use((req, res, next) => {
            // 忽略 favicon.ico 等常见浏览器请求
            if (req.path === '/favicon.ico' || req.path.endsWith('.ico')) {
                return res.status(244).end();
            }
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}

startServer();