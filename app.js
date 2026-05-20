const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const registerRoutes = require('./routes');
const weatherRoutes = require('./routes/weather-routes');
const WeatherScheduler = require('./scheduler/weather-scheduler');

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

            // 创建 weather_json 表（用于缓存地图瓦片）
            // 先检查表是否存在且结构是否正确
            db.get("PRAGMA table_info(weather_json)", [], (err, row) => {
                if (err || !row) {
                    // 表不存在或查询失败，创建新表
                    console.log('[Database] 创建 weather_json 表...');
                    createWeatherJsonTable();
                } else {
                    // 表存在，检查是否有 layer_type 字段
                    db.all("PRAGMA table_info(weather_json)", [], (err2, columns) => {
                        const hasLayerType = columns.some(col => col.name === 'layer_type');

                        if (!hasLayerType) {
                            // 旧表结构，需要重建
                            console.log('[Database] 检测到旧版 weather_json 表，正在重建...');
                            db.run("DROP TABLE IF EXISTS weather_json", [], (err3) => {
                                if (err3) {
                                    console.error("Error dropping old weather_json table:", err3);
                                }
                                createWeatherJsonTable();
                            });
                        } else {
                            console.log('[Database] weather_json 表结构正确');
                            createIndexes();
                        }
                    });
                }
            });

            function createWeatherJsonTable() {
                const createWeatherJsonTableSQL = `
                    CREATE TABLE IF NOT EXISTS weather_json (
                        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                        city_name TEXT NOT NULL,
                        layer_type TEXT NOT NULL,
                        zoom_level INTEGER NOT NULL,
                        tile_x INTEGER NOT NULL,
                        tile_y INTEGER NOT NULL,
                        file_path TEXT NOT NULL,
                        cached_at DATETIME NOT NULL,
                        expires_at DATETIME NOT NULL,
                        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
                        updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
                    )
                `;

                db.run(createWeatherJsonTableSQL, [], (err2) => {
                    if (err2) {
                        console.error("Error creating weather_json table:", err2);
                    } else {
                        console.log('[Database] weather_json 表已就绪');

                        // 检查并升级表结构（如果存在旧字段 tile_data）
                        db.all("PRAGMA table_info(weather_json)", [], (pragmaErr, columns) => {
                            if (pragmaErr) {
                                console.error('[Database] 检查表结构失败:', pragmaErr);
                                return createIndexes();
                            }

                            const hasTileData = columns.some(col => col.name === 'tile_data');
                            const hasFilePath = columns.some(col => col.name === 'file_path');

                            if (hasTileData && !hasFilePath) {
                                // 需要升级：添加 file_path 字段，删除 tile_data 字段
                                console.log('[Database] 检测到旧表结构，正在升级...');

                                // SQLite 不支持直接删除列，需要重建表
                                db.serialize(() => {
                                    db.run('BEGIN TRANSACTION');

                                    // 1. 创建新表
                                    db.run(`CREATE TABLE weather_json_new (
                                        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                                        city_name TEXT NOT NULL,
                                        layer_type TEXT NOT NULL,
                                        zoom_level INTEGER NOT NULL,
                                        tile_x INTEGER NOT NULL,
                                        tile_y INTEGER NOT NULL,
                                        file_path TEXT NOT NULL,
                                        cached_at DATETIME NOT NULL,
                                        expires_at DATETIME NOT NULL,
                                        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
                                        updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
                                    )`, (tableErr) => {
                                        if (tableErr) {
                                            console.error('[Database] 创建新表失败:', tableErr);
                                            db.run('ROLLBACK');
                                            return createIndexes();
                                        }

                                        // 2. 迁移数据（清空，因为 BLOB 数据无法迁移）
                                        db.run('INSERT INTO weather_json_new (id, city_name, layer_type, zoom_level, tile_x, tile_y, file_path, cached_at, expires_at, created_at, updated_at) SELECT id, city_name, layer_type, zoom_level, tile_x, tile_y, "", cached_at, expires_at, created_at, updated_at FROM weather_json', (insertErr) => {
                                            if (insertErr) {
                                                console.error('[Database] 迁移数据失败:', insertErr);
                                                db.run('ROLLBACK');
                                                return createIndexes();
                                            }

                                            // 3. 删除旧表
                                            db.run('DROP TABLE weather_json', (dropErr) => {
                                                if (dropErr) {
                                                    console.error('[Database] 删除旧表失败:', dropErr);
                                                    db.run('ROLLBACK');
                                                    return createIndexes();
                                                }

                                                // 4. 重命名新表
                                                db.run('ALTER TABLE weather_json_new RENAME TO weather_json', (renameErr) => {
                                                    if (renameErr) {
                                                        console.error('[Database] 重命名表失败:', renameErr);
                                                        db.run('ROLLBACK');
                                                        return createIndexes();
                                                    }

                                                    // 5. 提交事务
                                                    db.run('COMMIT', (commitErr) => {
                                                        if (commitErr) {
                                                            console.error('[Database] 提交事务失败:', commitErr);
                                                        } else {
                                                            console.log('[Database] 表结构升级完成');
                                                        }
                                                        createIndexes();
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            } else {
                                createIndexes();
                            }
                        });
                    }
                });
            }

            function createIndexes() {
                // 创建索引
                const createIndexes = [
                    `CREATE INDEX IF NOT EXISTS idx_weather_json_city ON weather_json(city_name)`,
                    `CREATE INDEX IF NOT EXISTS idx_weather_json_layer ON weather_json(layer_type)`,
                    `CREATE INDEX IF NOT EXISTS idx_weather_json_tile ON weather_json(zoom_level, tile_x, tile_y)`,
                    `CREATE INDEX IF NOT EXISTS idx_weather_json_expires ON weather_json(expires_at)`
                ];

                let completed = 0;
                createIndexes.forEach((indexSQL, idx) => {
                    db.run(indexSQL, [], (err3) => {
                        if (err3) {
                            console.error(`Error creating index ${idx}:`, err3);
                        }
                        completed++;
                        if (completed === createIndexes.length) {
                            console.log('[Database] weather_json 索引已创建');
                            resolve();
                        }
                    });
                });
            }
        });
    });
}

async function startServer() {
    try {
        await initDatabase();

        // 设置应用时区为东八区（中国标准时间）
        process.env.TZ = 'Asia/Shanghai';

        await initializeDatabase(); // 初始化数据库和默认设置

        // ==================== API 路由 ====================
        // 注册所有 API 路由（在数据库连接后，SPA 回退之前）
        registerRoutes(app, db);

        // 注册天气 API 路由
        weatherRoutes.setDatabase(db);
        app.use('/api/weather', weatherRoutes.router);

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

            // 启动天气数据定时任务
            const scheduler = new WeatherScheduler(db);
            scheduler.start();

            // 将 scheduler 挂载到 app 上，方便后续管理
            app.locals.weatherScheduler = scheduler;
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}

startServer();