const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const registerRoutes = require('./routes');
const WeatherScheduler = require('./scheduler/weather-scheduler');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, 'data', 'Votilarus.db');

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接
let db;

async function initDatabase() {
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

async function startServer() {
    try {
        await initDatabase();

        // 设置应用时区为东八区（中国标准时间）
        process.env.TZ = 'Asia/Shanghai';

        // ==================== API 路由 ====================
        registerRoutes(app, db);

        // 静态文件服务 - data 目录（专门处理 SVG 等文件）
        app.use('/data', (req, res, next) => {
            const fs = require('fs');
            const filePath = path.join(__dirname, 'data', req.path);

            if (!fs.existsSync(filePath)) {
                return next();
            }

            if (filePath.endsWith('.svg')) {
                res.set('Content-Type', 'image/svg+xml');
            }

            res.sendFile(filePath);
        });

        // 静态文件服务 - public 目录
        app.use(express.static(path.join(__dirname, 'public')));

        // SPA 路由回退（必须在最后）
        app.use((req, res, next) => {
            if (req.path === '/favicon.ico' || req.path.endsWith('.ico')) {
                return res.status(244).end();
            }
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);

            // 启动天气数据定时任务
            const scheduler = new WeatherScheduler(db);
            scheduler.start();
            app.locals.weatherScheduler = scheduler;
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}

startServer();