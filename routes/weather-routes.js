const express = require('express');
const router = express.Router();
const https = require('https');
const path = require('path');
const fs = require('fs');

// 需要注入 db 对象
let db;

// OpenWeatherMap API 配置
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '269d058c99d1f3cdcd9232f62910df1d';
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';
const TILE_API_BASE = 'https://tile.openweathermap.org/map';

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
            url = `${WEATHER_API_BASE}/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=zh_cn`;
        } else if (type === 'forecast') {
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

                    if (jsonData.cod === 200 || jsonData.cod === '200') {
                        resolve(jsonData);
                    } else {
                        reject(new Error(`API 错误 (${jsonData.cod}): ${jsonData.message || '未知错误'}`));
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
        // 使用东八区时间（UTC+8）
        const now = new Date();
        const utc8Now = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 转换为UTC+8
        const expiresAt = new Date(utc8Now.getTime() + 6 * 60 * 60 * 1000); // 6小时后过期

        // 将API返回的时间戳转换为东八区日期
        const weatherTimestamp = weatherData.dt * 1000;
        const utc8WeatherDate = new Date(weatherTimestamp + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);

        // 先删除旧数据，再插入新数据
        const deleteSql = `DELETE FROM weather_cache WHERE city_name = ? AND weather_date = ?`;

        db.run(deleteSql, [weatherData.name, utc8WeatherDate], function (deleteErr) {
            if (deleteErr) {
                // 继续执行插入
            }

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
                    cached_at, expires_at,
                    weather_date,
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
                utc8Now.toISOString().slice(0, 19).replace('T', ' '),  // cached_at
                expiresAt.toISOString().slice(0, 19).replace('T', ' '), // expires_at
                utc8WeatherDate                                      // weather_date (YYYY-MM-DD)
            ];

            db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
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
        console.log('[WeatherAPI] 开始获取当前天气:', city);

        // 1. 从 API 获取数据
        const weatherData = await fetchWeatherFromAPI(city, 'current');

        // 2. 只删除当前天气数据（今天的记录），保留预报数据
        console.log('[WeatherAPI] 删除', city, '的当前天气数据...');
        await new Promise((resolve, reject) => {
            db.run(
                `DELETE FROM weather_cache WHERE city_name = ? AND weather_date = DATE('now', 'localtime')`,
                [city],
                function (err) {
                    if (err) {
                        console.error('[WeatherAPI] 删除失败:', err);
                        reject(err);
                    } else {
                        console.log('[WeatherAPI] 已删除', this.changes, '条当前天气记录');
                        resolve();
                    }
                }
            );
        });

        // 3. 保存新数据
        const insertId = await saveCurrentWeather(weatherData);
        console.log('[WeatherAPI] 已保存新数据, ID:', insertId);

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

/**
 * 保存预报数据到数据库
 * @param {string} cityName - 城市名称
 * @param {Array} dailyForecast - 每日预报数组
 * @returns {Promise<void>}
 */
function saveForecastToCache(cityName, dailyForecast) {
    return new Promise((resolve, reject) => {
        if (!dailyForecast || dailyForecast.length === 0) {
            resolve();
            return;
        }

        const now = new Date();
        const utc8Now = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        const expiresAt = new Date(utc8Now.getTime() + 6 * 60 * 60 * 1000); // 6小时后过期

        let completed = 0;
        const total = dailyForecast.length;

        dailyForecast.forEach(day => {
            const sql = `
                INSERT OR REPLACE INTO weather_cache (
                    city_name, weather_date,
                    temp_max, temp_min, temperature, feels_like,
                    humidity, wind_speed, wind_deg,
                    weather_main, weather_description, weather_icon,
                    pressure, clouds_all,
                    cached_at, expires_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                cityName,
                day.date,
                day.temp_max,
                day.temp_min,
                day.temp_avg,
                day.feels_like_avg,
                day.humidity_avg,
                parseFloat(day.wind_speed_avg),
                day.wind_deg_avg,
                day.weather_main,
                day.weather_description,
                day.weather_icon,
                day.pressure_avg,
                day.clouds_avg,
                utc8Now.toISOString().slice(0, 19).replace('T', ' '),
                expiresAt.toISOString().slice(0, 19).replace('T', ' ')
            ];

            db.run(sql, params, function (err) {
                if (err) {
                    console.error('[天气缓存] 保存预报数据失败:', err);
                }
                completed++;
                if (completed === total) {
                    resolve();
                }
            });
        });
    });
}

/**
 * GET /api/weather/forecast/:city
 * 获取天气预报数据（历史 + 当前 + 未来预报）
 */
router.get('/forecast/:city', async (req, res) => {
    try {
        const cityName = req.params.city;

        // 1. 从数据库获取历史数据（最近7天）
        const historyRows = await new Promise((resolve, reject) => {
            const historySql = `
                SELECT 
                    wc.*,
                    DATE(wc.weather_date) as date_key
                FROM weather_cache wc
                INNER JOIN (
                    SELECT DATE(weather_date) as date_key, MAX(cached_at) as max_cached
                    FROM weather_cache
                    WHERE city_name = ?
                      AND weather_date < DATE('now', 'localtime')
                    GROUP BY DATE(weather_date)
                    ORDER BY DATE(weather_date) DESC
                    LIMIT 7
                ) latest ON DATE(wc.weather_date) = latest.date_key AND wc.cached_at = latest.max_cached
                WHERE wc.city_name = ?
                ORDER BY wc.weather_date ASC
            `;

            db.all(historySql, [cityName, cityName], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // 2. 获取当前天气（优先从缓存，否则从 API 获取）
        let currentData = await new Promise((resolve, reject) => {
            const currentSql = `
                SELECT * FROM weather_cache
                WHERE city_name = ?
                  AND expires_at > datetime('now', 'localtime')
                  AND weather_date = DATE('now', 'localtime')
                ORDER BY cached_at DESC
                LIMIT 1
            `;

            db.get(currentSql, [cityName], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        let currentFromCache = !!currentData;

        // 如果缓存不存在或已过期，从 API 获取
        if (!currentData) {
            try {
                await fetchAndSaveCurrentWeather(cityName);
                // 从数据库重新获取，确保数据格式一致
                currentData = await new Promise((resolve, reject) => {
                    const currentSql = `
                        SELECT * FROM weather_cache
                        WHERE city_name = ?
                          AND expires_at > datetime('now', 'localtime')
                          AND weather_date = DATE('now', 'localtime')
                        ORDER BY cached_at DESC
                        LIMIT 1
                    `;
                    db.get(currentSql, [cityName], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
                currentFromCache = false;
            } catch (apiError) {
                return res.status(500).json({
                    success: false,
                    error: '获取当前天气失败',
                    details: apiError.message
                });
            }
        }

        // 3. 获取预报数据（智能缓存：只获取缺失的日期）
        let dailyForecast = [];
        let forecastFromCache = true;

        try {
            // 3.1 查询数据库中已有的未来预报日期
            const cachedForecastDates = await new Promise((resolve, reject) => {
                const sql = `
                    SELECT DISTINCT weather_date
                    FROM weather_cache
                    WHERE city_name = ?
                      AND expires_at > datetime('now', 'localtime')
                      AND weather_date > DATE('now', 'localtime')
                    ORDER BY weather_date ASC
                `;

                console.log('[WeatherAPI] 执行 SQL 查询缓存日期...');
                db.all(sql, [cityName], (err, rows) => {
                    if (err) {
                        console.error('[WeatherAPI] SQL 查询失败:', err);
                        reject(err);
                    } else {
                        const dates = rows.map(r => r.weather_date);
                        console.log('[WeatherAPI] SQL 查询结果:', dates);
                        resolve(dates);
                    }
                });
            });

            // 3.2 检查是否需要从 API 获取新数据
            const utc8Now = new Date(Date.now() + 8 * 60 * 60 * 1000);
            const today = utc8Now.toISOString().slice(0, 10);

            console.log('[WeatherAPI] 缓存检查:', {
                城市: cityName,
                JS计算的今天: today,
                数据库中的缓存日期: cachedForecastDates,
                缓存日期数量: cachedForecastDates.length
            });

            // 计算需要的日期范围（今天之后的4天，因为 API 限制）
            const neededDates = [];
            for (let i = 1; i <= 4; i++) {
                const futureDate = new Date(utc8Now.getTime() + i * 24 * 60 * 60 * 1000);
                neededDates.push(futureDate.toISOString().slice(0, 10));
            }

            console.log('[WeatherAPI] 需要的日期:', neededDates);

            // 找出缺失的日期
            const missingDates = neededDates.filter(date => !cachedForecastDates.includes(date));

            console.log('[WeatherAPI] 缺失的日期:', missingDates);

            if (missingDates.length > 0) {
                // 有缺失的日期，需要从 API 获取
                console.log('[WeatherAPI] 检测到缺失的预报日期:', missingDates, '(共', missingDates.length, '天)');
                const forecastData = await fetchWeatherFromAPI(cityName, 'forecast');
                const allForecast = processForecastData(forecastData.list);

                // 只保存缺失日期的数据
                const missingForecast = allForecast.filter(day => missingDates.includes(day.date));
                await saveForecastToCache(cityName, missingForecast);
                forecastFromCache = false;
                console.log('[WeatherAPI] 已保存', missingForecast.length, '天的预报数据到数据库');
            } else {
                console.log('[WeatherAPI] 所有预报数据都在缓存中，无需调用 API');
            }

            // 3.3 从数据库读取所有预报数据
            dailyForecast = await new Promise((resolve, reject) => {
                const sql = `
                    SELECT 
                        weather_date as date,
                        temp_max,
                        temp_min,
                        temperature as temp_avg,
                        feels_like as feels_like_avg,
                        humidity as humidity_avg,
                        wind_speed as wind_speed_avg,
                        wind_deg as wind_deg_avg,
                        weather_main,
                        weather_description,
                        weather_icon,
                        pressure as pressure_avg,
                        clouds_all as clouds_avg
                    FROM weather_cache
                    WHERE city_name = ?
                      AND expires_at > datetime('now', 'localtime')
                      AND weather_date > DATE('now', 'localtime')
                    ORDER BY weather_date ASC
                    LIMIT 4
                `;

                db.all(sql, [cityName], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        } catch (forecastError) {
            console.error('[WeatherAPI] 获取预报数据失败:', forecastError.message);
            // 即使失败也尝试从数据库读取已有数据
            dailyForecast = await new Promise((resolve) => {
                const sql = `
                    SELECT 
                        weather_date as date,
                        temp_max,
                        temp_min,
                        temperature as temp_avg,
                        feels_like as feels_like_avg,
                        humidity as humidity_avg,
                        wind_speed as wind_speed_avg,
                        wind_deg as wind_deg_avg,
                        weather_main,
                        weather_description,
                        weather_icon,
                        pressure as pressure_avg,
                        clouds_all as clouds_avg
                    FROM weather_cache
                    WHERE city_name = ?
                      AND expires_at > datetime('now', 'localtime')
                      AND weather_date > DATE('now', 'localtime')
                    ORDER BY weather_date ASC
                    LIMIT 4
                `;
                db.all(sql, [cityName], (err, rows) => {
                    resolve(rows || []);
                });
            });
        }

        // 4. 组合所有数据
        console.log('[WeatherAPI] 数据组装:', {
            城市: cityName,
            历史数据条数: historyRows.length,
            历史日期: historyRows.map(r => r.weather_date),
            当前数据来源: currentFromCache ? '缓存' : 'API',
            预报数据来源: forecastFromCache ? '缓存' : 'API',
            预报数据条数: dailyForecast.length,
            预报日期: dailyForecast.map(d => d.date)
        });

        const allWeatherData = {
            history: historyRows.map(row => ({
                date: row.weather_date,
                temp_max: row.temp_max,
                temp_min: row.temp_min,
                temp: row.temperature,
                feels_like: row.feels_like,
                humidity: row.humidity,
                wind_speed: row.wind_speed,
                wind_deg: row.wind_deg,
                weather_main: row.weather_main,
                weather_description: row.weather_description,
                weather_icon: row.weather_icon,
                pressure: row.pressure,
                clouds: row.clouds_all,
                visibility: row.visibility ? (row.visibility / 1000).toFixed(1) : null
            })),
            current: {
                date: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10),
                temp_max: currentData.temp_max,
                temp_min: currentData.temp_min,
                temp: currentData.temperature,
                feels_like: currentData.feels_like,
                humidity: currentData.humidity,
                wind_speed: currentData.wind_speed,
                wind_deg: currentData.wind_deg,
                weather_main: currentData.weather_main,
                weather_description: currentData.weather_description,
                weather_icon: currentData.weather_icon,
                pressure: currentData.pressure,
                clouds: currentData.clouds_all,
                visibility: currentData.visibility ? (currentData.visibility / 1000).toFixed(1) : null
            },
            forecast: dailyForecast
        };

        res.json({
            success: true,
            fromCache: currentFromCache,
            data: allWeatherData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 处理预报数据，按天分组并提取每日摘要
 * @param {Array} forecastList - OpenWeatherMap 预报列表
 * @returns {Array} 每日预报摘要
 */
function processForecastData(forecastList) {
    const dailyMap = new Map();

    forecastList.forEach((item) => {
        // 使用东八区时间（UTC+8）
        const utc8Time = new Date(item.dt * 1000 + 8 * 60 * 60 * 1000);
        const date = utc8Time.toISOString().slice(0, 10);

        if (!dailyMap.has(date)) {
            dailyMap.set(date, {
                date: date,
                temp_max: item.main.temp_max,
                temp_min: item.main.temp_min,
                temps: [],
                feels_likes: [],
                humidities: [],
                wind_speeds: [],
                wind_degs: [],
                weather_main: item.weather[0].main,
                weather_description: item.weather[0].description,
                weather_icon: item.weather[0].icon,
                pressures: [],
                clouds_list: [],
                visibilities: []
            });
        }

        const dayData = dailyMap.get(date);
        dayData.temps.push(item.main.temp);
        dayData.feels_likes.push(item.main.feels_like);
        dayData.humidities.push(item.main.humidity);
        dayData.wind_speeds.push(item.wind.speed);
        dayData.wind_degs.push(item.wind.deg);
        dayData.pressures.push(item.main.pressure);
        dayData.clouds_list.push(item.clouds.all);
        if (item.visibility !== undefined) {
            dayData.visibilities.push(item.visibility);
        }

        // 更新最高/最低温度
        if (item.main.temp_max > dayData.temp_max) {
            dayData.temp_max = item.main.temp_max;
        }
        if (item.main.temp_min < dayData.temp_min) {
            dayData.temp_min = item.main.temp_min;
        }

        // 使用中午12点左右的天气图标作为当天的代表（东八区时间）
        const hour = utc8Time.getUTCHours();
        if (hour >= 11 && hour <= 13) {
            dayData.weather_main = item.weather[0].main;
            dayData.weather_description = item.weather[0].description;
            dayData.weather_icon = item.weather[0].icon;
        }
    });

    // 计算平均值并转换为数组
    const dailyForecast = Array.from(dailyMap.values()).map(day => ({
        date: day.date,
        temp_max: Math.round(day.temp_max),
        temp_min: Math.round(day.temp_min),
        temp_avg: Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length),
        feels_like_avg: Math.round(day.feels_likes.reduce((a, b) => a + b, 0) / day.feels_likes.length),
        humidity_avg: Math.round(day.humidities.reduce((a, b) => a + b, 0) / day.humidities.length),
        wind_speed_avg: (day.wind_speeds.reduce((a, b) => a + b, 0) / day.wind_speeds.length).toFixed(2),
        wind_deg_avg: Math.round(day.wind_degs.reduce((a, b) => a + b, 0) / day.wind_degs.length),
        weather_main: day.weather_main,
        weather_description: day.weather_description,
        weather_icon: day.weather_icon,
        pressure_avg: Math.round(day.pressures.reduce((a, b) => a + b, 0) / day.pressures.length),
        clouds_avg: Math.round(day.clouds_list.reduce((a, b) => a + b, 0) / day.clouds_list.length),
        visibility_avg: day.visibilities.length > 0 ? Math.round(day.visibilities.reduce((a, b) => a + b, 0) / day.visibilities.length / 1000 * 10) / 10 : null
    }));

    // 只返回未来的预报（不包括今天），最多4天（API 限制）
    const utc8Now = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const today = utc8Now.toISOString().slice(0, 10);
    const futureForecast = dailyForecast.filter(day => day.date > today);

    return futureForecast.slice(0, 4);
}

/**
 * PUT /api/weather/city
 * 更新天气组件的城市配置（保存到 settings 表）
 */
router.put('/city', (req, res) => {
    const { city } = req.body;

    if (!city) {
        return res.status(400).json({
            success: false,
            error: '城市名称不能为空'
        });
    }

    try {
        // 检查是否已存在城市配置
        const checkSql = `SELECT id FROM settings WHERE key = ? LIMIT 1`;

        db.get(checkSql, ['weather_city'], (err, row) => {
            if (err) {
                console.error('查询城市配置失败:', err);
                res.status(500).json({
                    success: false,
                    error: '查询城市配置失败'
                });
                return;
            }

            let updateSql;
            let params;

            if (row) {
                // 更新现有配置
                updateSql = `UPDATE settings SET value = ? WHERE key = ?`;
                params = [city, 'weather_city'];
            } else {
                // 插入新配置
                updateSql = `INSERT INTO settings (key, value, type, isdisplay, isdel) VALUES (?, ?, 'personal', '1', '0')`;
                params = ['weather_city', city];
            }

            db.run(updateSql, params, function (err) {
                if (err) {
                    console.error('更新城市配置失败:', err);
                    res.status(500).json({
                        success: false,
                        error: '更新城市配置失败'
                    });
                    return;
                }


                res.json({
                    success: true,
                    message: '城市配置已更新',
                    city: city
                });
            });
        });
    } catch (error) {
        console.error('更新城市配置异常:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 导出模块
module.exports = {
    router,
    setDatabase,
    fetchAndSaveCurrentWeather
};

// ==================== 地图瓦片 API ====================

/**
 * GET /api/weather/tile/:layer/:z/:x/:y
 * 获取地图瓦片（优先从缓存，缓存失效则从 API 获取）
 */
router.get('/tile/:layer/:z/:x/:y', (req, res) => {
    const { layer, z, x, y } = req.params;
    const zoom = parseInt(z);
    const tileX = parseInt(x);
    const tileY = parseInt(y);

    // 验证图层类型
    const validLayers = ['temp_new', 'wind_new', 'precipitation_new', 'clouds_new', 'pressure_new', 'snow_new'];
    if (!validLayers.includes(layer)) {
        return res.status(400).json({
            success: false,
            error: '不支持的图层类型'
        });
    }

    // 1. 查询缓存
    const cacheSql = `
        SELECT file_path FROM weather_json
        WHERE layer_type = ?
          AND zoom_level = ?
          AND tile_x = ?
          AND tile_y = ?
          AND expires_at > datetime('now', 'localtime')
        LIMIT 1
    `;

    db.get(cacheSql, [layer, zoom, tileX, tileY], (err, row) => {
        if (err) {
            console.error('[TileAPI] 查询缓存失败:', err);
            return res.status(500).json({ error: err.message });
        }

        // 如果缓存存在且有效，读取文件并返回
        if (row && row.file_path) {
            const filePath = path.join(__dirname, '..', 'public', 'static', 'background', 'weather_json', row.file_path);

            // 检查文件是否存在
            if (fs.existsSync(filePath)) {
                res.set('Content-Type', 'image/png');
                res.set('Cache-Control', 'public, max-age=21600'); // 6小时缓存
                return res.sendFile(filePath);
            }
        }

        // 2. 缓存不存在或已过期，从 API 获取
        const tileUrl = `${TILE_API_BASE}/${layer}/${zoom}/${tileX}/${tileY}.png?appid=${WEATHER_API_KEY}`;

        https.get(tileUrl, (apiRes) => {
            const chunks = [];

            apiRes.on('data', (chunk) => {
                chunks.push(chunk);
            });

            apiRes.on('end', () => {
                const buffer = Buffer.concat(chunks);

                // 检查是否成功获取
                if (apiRes.statusCode !== 200) {
                    return res.status(apiRes.statusCode).json({
                        success: false,
                        error: '获取瓦片失败'
                    });
                }

                // 3. 保存到文件系统
                const now = new Date();
                const utc8Now = new Date(now.getTime() + 8 * 60 * 60 * 1000);
                const expiresAt = new Date(utc8Now.getTime() + 6 * 60 * 60 * 1000); // 6小时后过期

                // 构建文件路径: layer/z{x}/x{x}_y{y}.png
                const fileName = `x${tileX}_y${tileY}.png`;
                const dirPath = path.join(__dirname, '..', 'public', 'static', 'background', 'weather_json', layer, `z${zoom}`);
                const relativePath = path.join(layer, `z${zoom}`, fileName);
                const fullPath = path.join(dirPath, fileName);

                // 确保目录存在
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                }

                // 写入文件
                try {
                    fs.writeFileSync(fullPath, buffer);
                } catch (writeErr) {
                    console.error('[TileAPI] 保存瓦片文件失败:', writeErr);
                    return res.status(500).json({ error: '保存文件失败' });
                }

                // 4. 保存到数据库（只存路径）
                const insertSql = `
                    INSERT INTO weather_json (
                        city_name, layer_type, zoom_level, tile_x, tile_y,
                        file_path, cached_at, expires_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const params = [
                    'global', // 瓦片是全球性的，使用 'global' 作为城市名
                    layer,
                    zoom,
                    tileX,
                    tileY,
                    relativePath,
                    utc8Now.toISOString().slice(0, 19).replace('T', ' '),
                    expiresAt.toISOString().slice(0, 19).replace('T', ' ')
                ];

                db.run(insertSql, params, function (insertErr) {
                    if (insertErr) {
                        console.error('[TileAPI] 保存瓦片记录失败:', insertErr);
                    }
                });

                // 5. 返回图片
                res.set('Content-Type', 'image/png');
                res.set('Cache-Control', 'public, max-age=21600');
                res.send(buffer);
            });
        }).on('error', (error) => {
            console.error('[TileAPI] 获取瓦片失败:', error);
            res.status(500).json({
                success: false,
                error: '网络错误'
            });
        });
    });
});

/**
 * POST /api/weather/tile/cleanup
 * 清理过期的瓦片缓存数据（包括文件和数据库记录）
 */
router.post('/tile/cleanup', (req, res) => {
    // 1. 先查询所有过期记录的文件路径
    const selectSql = `SELECT file_path FROM weather_json WHERE expires_at <= datetime('now', 'localtime')`;

    db.all(selectSql, [], (err, rows) => {
        if (err) {
            console.error('[TileCleanup] 查询过期记录失败:', err);
            return res.status(500).json({ error: err.message });
        }

        // 2. 删除物理文件
        let deletedFiles = 0;
        if (rows && rows.length > 0) {
            rows.forEach(row => {
                if (row.file_path) {
                    const filePath = path.join(__dirname, '..', 'public', 'static', 'background', 'weather_json', row.file_path);
                    try {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            deletedFiles++;
                        }
                    } catch (fileErr) {
                        console.error(`[TileCleanup] 删除文件失败: ${filePath}`, fileErr);
                    }
                }
            });
        }

        // 3. 删除数据库记录
        const deleteSql = `DELETE FROM weather_json WHERE expires_at <= datetime('now', 'localtime')`;

        db.run(deleteSql, [], function (dbErr) {
            if (dbErr) {
                console.error('[TileCleanup] 删除数据库记录失败:', dbErr);
                return res.status(500).json({ error: dbErr.message });
            }

            res.json({
                success: true,
                message: `已清理 ${this.changes} 条过期记录，删除 ${deletedFiles} 个文件`
            });
        });
    });
});
