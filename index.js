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
                console.error('数据库连接失败:', err.message);
                reject(err);
            } else {
                console.log('已连接到 SQLite 数据库');
                resolve();
            }
        });
    });
}

async function startServer() {
    try {
        await initDatabase();
        
        // ==================== API 路由 ====================
        // 注册所有 API 路由（在数据库连接后，SPA 回退之前）
        registerRoutes(app, db);
        
        // 静态文件服务 - data 目录（专门处理 SVG 等文件）
        app.use('/data', (req, res, next) => {
            const fs = require('fs');
            // req.path 已经去掉了 /data 前缀，例如: /category/network.svg
            const filePath = path.join(__dirname, 'data', req.path);
            console.log(`📁 静态文件请求: ${req.originalUrl} -> ${filePath}`);
            
            // 检查文件是否存在
            if (!fs.existsSync(filePath)) {
                console.log(`  ❌ 文件不存在`);
                return next();
            }
            
            // 为 SVG 文件设置正确的 MIME 类型
            if (filePath.endsWith('.svg')) {
                res.set('Content-Type', 'image/svg+xml');
                console.log(`  ✅ SVG 文件，设置 Content-Type: image/svg+xml`);
            }
            
            res.sendFile(filePath);
        });
        
        // 静态文件服务 - public 目录
        app.use(express.static(path.join(__dirname, 'public')));
        
        // SPA 路由回退（必须在最后）
        app.use((req, res, next) => {
            console.log(`  ↳ SPA 回退: ${req.path}`);
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });
        
        app.listen(PORT, () => {
            console.log(`服务器运行在 http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('服务器启动失败:', err);
        process.exit(1);
    }
}

startServer();
