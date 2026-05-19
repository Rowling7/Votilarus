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

        console.log('[API调用] 请求 URL:', url);
        console.log('[API调用] API Key:', WEATHER_API_KEY.substring(0, 8) + '...');

        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    console.log('[API调用] 原始响应数据:', data);
                    const jsonData = JSON.parse(data);
                    console.log('[API调用] 解析后的数据 cod:', jsonData.cod);

                    if (jsonData.cod === 200 || jsonData.cod === '200') {
                        resolve(jsonData);
                    } else {
                        console.error('[API调用] API 返回错误:', jsonData);
                        reject(new Error(`API 错误 (${jsonData.cod}): ${jsonData.message || '未知错误'}`));
                    }
                } catch (error) {
                    console.error('[API调用] 解析 JSON 失败:', error);
                    console.error('[API调用] 原始数据:', data);
                    reject(error);
                }
            });
        }).on('error', (error) => {
            console.error('[API调用] HTTPS 请求错误:', error);
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
        const weatherDate = new Date(weatherData.dt * 1000).toISOString().slice(0, 10);

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
                weather_date,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
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
            1,                                                   // is_valid
            weatherDate                                          // weather_date (YYYY-MM-DD)
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

/**
 * GET /api/weather/forecast/:city
 * 获取天气预报数据（历史 + 当前 + 未来预报）
 */
router.get('/forecast/:city', async (req, res) => {
    console.log('========================================');
    console.log('[API] 收到天气预报请求');
    console.log('[API] 城市:', req.params.city);
    console.log('[API] 完整URL:', req.originalUrl);
    console.log('========================================');

    try {
        const cityName = req.params.city;

        // 1. 从数据库获取历史数据（最近7天，每天取最新的一条）
        const historySql = `
            SELECT 
                wc.*,
                DATE(wc.weather_date) as date_key
            FROM weather_cache wc
            INNER JOIN (
                SELECT DATE(weather_date) as date_key, MAX(cached_at) as max_cached
                FROM weather_cache
                WHERE city_name = ?
                  AND is_valid = 1
                  AND weather_date < DATE('now', 'localtime')
                GROUP BY DATE(weather_date)
                ORDER BY DATE(weather_date) DESC
                LIMIT 7
            ) latest ON DATE(wc.weather_date) = latest.date_key AND wc.cached_at = latest.max_cached
            WHERE wc.city_name = ?
            ORDER BY wc.weather_date ASC
        `;

        db.all(historySql, [cityName, cityName], (err, historyRows) => {
            if (err) {
                console.error('[API] 查询历史天气失败:', err);
                res.status(500).json({ error: err.message });
                return;
            }

            console.log('[API] 历史数据查询结果:', historyRows.length, '条');
            if (historyRows.length > 0) {
                console.log('[API] 历史日期列表:', historyRows.map(r => r.weather_date));
            }

            // 2. 获取当前天气（优先从缓存）
            const currentSql = `
                SELECT * FROM weather_cache
                WHERE city_name = ?
                  AND is_valid = 1
                  AND expires_at > datetime('now', 'localtime')
                ORDER BY cached_at DESC
                LIMIT 1
            `;

            db.get(currentSql, [cityName], async (err2, currentData) => {
                if (err2) {
                    console.error('[API] 查询当前天气失败:', err2);
                    res.status(500).json({ error: err2.message });
                    return;
                }

                console.log('[API] 当前天气缓存:', currentData ? '存在' : '不存在');

                let finalCurrentData = currentData;

                // 如果缓存不存在或已过期，从 API 获取
                if (!currentData) {
                    try {
                        const result = await fetchAndSaveCurrentWeather(cityName);
                        finalCurrentData = result.data;
                    } catch (apiError) {
                        console.error('获取当前天气 API 失败:', apiError);
                        res.status(500).json({ error: '获取当前天气失败' });
                        return;
                    }
                }

                // 3. 从 OpenWeatherMap 获取预报数据（5天，每3小时）
                try {
                    console.log('[天气预报] 开始获取预报数据，城市:', cityName);
                    const forecastData = await fetchWeatherFromAPI(cityName, 'forecast');

                    console.log('[天气预报] API 返回的预报数据条数:', forecastData.list.length);
                    console.log('[天气预报] 预报数据时间范围:');
                    if (forecastData.list.length > 0) {
                        const firstDate = new Date(forecastData.list[0].dt * 1000).toISOString();
                        const lastDate = new Date(forecastData.list[forecastData.list.length - 1].dt * 1000).toISOString();
                        console.log('  - 第一条:', firstDate);
                        console.log('  - 最后一条:', lastDate);
                    }

                    // 处理预报数据：按天分组，提取每天的摘要信息
                    const dailyForecast = processForecastData(forecastData.list);

                    console.log('[天气预报] 处理后的预报天数:', dailyForecast.length);
                    console.log('[天气预报] 预报日期列表:', dailyForecast.map(d => d.date));

                    // 组合所有数据
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
                            clouds: row.clouds_all
                        })),
                        current: {
                            date: new Date().toISOString().slice(0, 10),
                            temp_max: finalCurrentData.main.temp_max,
                            temp_min: finalCurrentData.main.temp_min,
                            temp: finalCurrentData.main.temp,
                            feels_like: finalCurrentData.main.feels_like,
                            humidity: finalCurrentData.main.humidity,
                            wind_speed: finalCurrentData.wind.speed,
                            wind_deg: finalCurrentData.wind.deg,
                            weather_main: finalCurrentData.weather[0].main,
                            weather_description: finalCurrentData.weather[0].description,
                            weather_icon: finalCurrentData.weather[0].icon,
                            pressure: finalCurrentData.main.pressure,
                            clouds: finalCurrentData.clouds.all
                        },
                        forecast: dailyForecast
                    };

                    res.json({
                        success: true,
                        data: allWeatherData
                    });
                } catch (forecastError) {
                    console.error('[天气预报] 获取预报数据失败:', forecastError);
                    console.error('[天气预报] 错误详情:', forecastError.message);
                    // 即使预报失败，也返回历史和当前数据
                    res.json({
                        success: true,
                        data: {
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
                                clouds: row.clouds_all
                            })),
                            current: {
                                date: new Date().toISOString().slice(0, 10),
                                temp_max: finalCurrentData.main.temp_max,
                                temp_min: finalCurrentData.main.temp_min,
                                temp: finalCurrentData.main.temp,
                                feels_like: finalCurrentData.main.feels_like,
                                humidity: finalCurrentData.main.humidity,
                                wind_speed: finalCurrentData.wind.speed,
                                wind_deg: finalCurrentData.wind.deg,
                                weather_main: finalCurrentData.weather[0].main,
                                weather_description: finalCurrentData.weather[0].description,
                                weather_icon: finalCurrentData.weather[0].icon,
                                pressure: finalCurrentData.main.pressure,
                                clouds: finalCurrentData.clouds.all
                            },
                            forecast: []
                        }
                    });
                }
            });
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
    console.log('[数据处理] 开始处理预报数据，原始数据条数:', forecastList.length);

    const dailyMap = new Map();

    forecastList.forEach((item, index) => {
        const date = new Date(item.dt * 1000).toISOString().slice(0, 10);
        const dateTime = new Date(item.dt * 1000).toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        if (index < 3 || index === forecastList.length - 1) {
            console.log(`[数据处理] 第${index + 1}条数据:`, {
                日期: dateTime,
                温度: item.main.temp,
                最高温: item.main.temp_max,
                最低温: item.main.temp_min,
                天气: item.weather[0].description
            });
        }

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
                clouds_list: []
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

        // 更新最高/最低温度
        if (item.main.temp_max > dayData.temp_max) {
            dayData.temp_max = item.main.temp_max;
        }
        if (item.main.temp_min < dayData.temp_min) {
            dayData.temp_min = item.main.temp_min;
        }

        // 使用中午12点左右的天气图标作为当天的代表
        const hour = new Date(item.dt * 1000).getHours();
        if (hour >= 11 && hour <= 13) {
            dayData.weather_main = item.weather[0].main;
            dayData.weather_description = item.weather[0].description;
            dayData.weather_icon = item.weather[0].icon;
        }
    });

    console.log('[数据处理] 按天分组后的天数:', dailyMap.size);
    console.log('[数据处理] 日期列表:', Array.from(dailyMap.keys()));

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
        clouds_avg: Math.round(day.clouds_list.reduce((a, b) => a + b, 0) / day.clouds_list.length)
    }));

    console.log('[数据处理] 最终返回的预报天数:', dailyForecast.length);
    console.log('[数据处理] 返回的日期:', dailyForecast.map(d => d.date));

    // 只返回前6天的预报（从今天开始算起）
    const today = new Date().toISOString().slice(0, 10);
    const futureForecast = dailyForecast.filter(day => day.date > today);
    console.log('[数据处理] 过滤后的未来预报天数:', futureForecast.length);

    return futureForecast.slice(0, 6);
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
