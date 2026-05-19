const express = require('express');
const router = express.Router();
const https = require('https');

// 需要注入 db 对象
let db;

// OpenWeatherMap API 配置
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '269d058c99d1f3cdcd9232f62910df1d';
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

/**
 * 从 OpenWeatherMap API 获取天气数据
 * @param {string} city - 城市名称
 * @param {string} type - 数据类型: 'current' 或 'forecast'
 * @returns {Promise<Object>} 天气数据
 */
function fetchWeatherFromAPI(city, type = 'current') {
    return new Promise((resolve, reject) => {
        let url;

        if (type === 'current') {
            // 当前天气
            url = `${WEATHER_API_BASE}/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=zh_cn`;
        } else if (type === 'forecast') {
            // 5天预报（每3小时）
            url = `${WEATHER_API_BASE}/forecast?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=zh_cn`;
        } else {
            reject(new Error('不支持的天气类型'));
            return;
        }

        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    if (jsonData.cod === 200) {
                        resolve(jsonData);
                    } else {
                        reject(new Error(`API 错误: ${jsonData.message}`));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * 解析当前天气数据并插入数据库
 * @param {Object} weatherData - API 返回的天气数据
 * @returns {Promise<number>} 插入的记录ID
 */
function saveCurrentWeather(weatherData) {
    return new Promise((resolve, reject) => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30分钟后过期

        const sql = `
            INSERT INTO weather_cache (
                city_name, city_id, country_code,
                longitude, latitude,
                weather_id, weather_main, weather_description, weather_icon,
                temperature, feels_like, temp_min, temp_max,
                pressure, humidity, sea_level, grnd_level,
                wind_speed, wind_deg, wind_gust,
                clouds_all, visibility,
                sunrise, sunset, timezone_offset,
                api_cod,
                cached_at, expires_at, is_valid,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `;

        const params = [
            weatherData.name,                                    // city_name
            weatherData.id,                                      // city_id
            weatherData.sys.country,                             // country_code
            weatherData.coord.lon,                               // longitude
            weatherData.coord.lat,                               // latitude
            weatherData.weather[0].id,                           // weather_id
            weatherData.weather[0].main,                         // weather_main
            weatherData.weather[0].description,                  // weather_description
            weatherData.weather[0].icon,                         // weather_icon
            weatherData.main.temp,                               // temperature
            weatherData.main.feels_like,                         // feels_like
            weatherData.main.temp_min,                           // temp_min
            weatherData.main.temp_max,                           // temp_max
            weatherData.main.pressure,                           // pressure
            weatherData.main.humidity,                           // humidity
            weatherData.main.sea_level || null,                  // sea_level
            weatherData.main.grnd_level || null,                 // grnd_level
            weatherData.wind.speed,                              // wind_speed
            weatherData.wind.deg,                                // wind_deg
            weatherData.wind.gust || null,                       // wind_gust
            weatherData.clouds.all,                              // clouds_all
            weatherData.visibility || null,                      // visibility
            weatherData.sys.sunrise,                             // sunrise
            weatherData.sys.sunset,                              // sunset
            weatherData.timezone,                                // timezone_offset
            weatherData.cod,                                     // api_cod
            now.toISOString().slice(0, 19).replace('T', ' '),  // cached_at
            expiresAt.toISOString().slice(0, 19).replace('T', ' '), // expires_at
            1                                                    // is_valid
        ];

        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

/**
 * 标记旧缓存为无效
 * @param {string} cityName - 城市名称
 * @returns {Promise<void>}
 */
function invalidateOldCache(cityName) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE weather_cache 
            SET is_valid = 0, updated_at = datetime('now')
            WHERE city_name = ? AND is_valid = 1
        `;

        db.run(sql, [cityName], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * 获取并保存当前天气
 * @param {string} city - 城市名称
 * @returns {Promise<Object>} 保存的天气数据
 */
async function fetchAndSaveCurrentWeather(city) {
    try {
        // 1. 从 API 获取数据
        const weatherData = await fetchWeatherFromAPI(city, 'current');

        // 2. 标记旧缓存为无效
        await invalidateOldCache(city);

        // 3. 保存新数据
        const insertId = await saveCurrentWeather(weatherData);

        return {
            success: true,
            insertId: insertId,
            data: weatherData
        };
    } catch (error) {
        throw error;
    }
}

// ==================== API 路由 ====================

/**
 * GET /api/weather/current/:city
 * 获取当前天气（优先从缓存，缓存失效则从 API 获取）
 */
router.get('/current/:city', async (req, res) => {
    try {
        const cityName = req.params.city;

        // 1. 先查询有效缓存
        const cacheSql = `
            SELECT * FROM weather_cache
            WHERE city_name = ?
              AND is_valid = 1
              AND expires_at > datetime('now', 'localtime')
            ORDER BY cached_at DESC
            LIMIT 1
        `;

        db.get(cacheSql, [cityName], async (err, cachedData) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            // 如果缓存存在且有效，直接返回
            if (cachedData) {
                res.json({
                    success: true,
                    fromCache: true,
                    data: cachedData
                });
                return;
            }

            // 缓存不存在或已过期，从 API 获取
            try {
                const result = await fetchAndSaveCurrentWeather(cityName);
                res.json({
                    success: true,
                    fromCache: false,
                    data: result.data
                });
            } catch (apiError) {
                res.status(500).json({
                    success: false,
                    error: apiError.message
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/weather/refresh/:city
 * 强制刷新天气数据（总是从 API 获取）
 */
router.get('/refresh/:city', async (req, res) => {
    try {
        const cityName = req.params.city;

        const result = await fetchAndSaveCurrentWeather(cityName);

        res.json({
            success: true,
            message: '天气数据已刷新',
            data: result.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/weather/history/:city
 * 获取某城市的历史天气记录
 */
router.get('/history/:city', (req, res) => {
    const cityName = req.params.city;
    const limit = parseInt(req.query.limit) || 10;

    const sql = `
        SELECT * FROM weather_cache
        WHERE city_name = ?
        ORDER BY cached_at DESC
        LIMIT ?
    `;

    db.all(sql, [cityName, limit], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    });
});

/**
 * POST /api/weather/cleanup
 * 清理过期缓存数据
 */
router.post('/cleanup', (req, res) => {
    const mode = req.body.mode || 'mark'; // 'mark' 或 'delete'

    if (mode === 'delete') {
        // 物理删除
        const sql = `DELETE FROM weather_cache WHERE expires_at <= datetime('now', 'localtime')`;

        db.run(sql, [], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            res.json({
                success: true,
                message: `已删除 ${this.changes} 条过期记录`
            });
        });
    } else {
        // 标记为无效
        const sql = `
            UPDATE weather_cache 
            SET is_valid = 0, updated_at = datetime('now')
            WHERE expires_at <= datetime('now', 'localtime')
              AND is_valid = 1
        `;

        db.run(sql, [], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            res.json({
                success: true,
                message: `已标记 ${this.changes} 条记录为过期`
            });
        });
    }
});

/**
 * GET /api/weather/stats
 * 获取缓存统计信息
 */
router.get('/stats', (req, res) => {
    const statsSql = `
        SELECT 
            COUNT(*) as total_count,
            SUM(CASE WHEN is_valid = 1 THEN 1 ELSE 0 END) as valid_count,
            SUM(CASE WHEN is_valid = 0 THEN 1 ELSE 0 END) as expired_count,
            COUNT(DISTINCT city_name) as city_count
        FROM weather_cache
    `;

    db.get(statsSql, [], (err, stats) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // 获取各城市的缓存数量
        const citySql = `
            SELECT city_name, COUNT(*) as cache_count
            FROM weather_cache
            WHERE is_valid = 1
            GROUP BY city_name
            ORDER BY cache_count DESC
        `;

        db.all(citySql, [], (err2, cities) => {
            if (err2) {
                res.status(500).json({ error: err2.message });
                return;
            }

            res.json({
                success: true,
                stats: stats,
                cities: cities
            });
        });
    });
});

// 导出模块
module.exports = {
    router,
    setDatabase,
    fetchAndSaveCurrentWeather
};
