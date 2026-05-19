const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

// 热门城市列表（固定顺序）
const FEATURED_CITIES = ['Weihai', 'Wuhan', 'Guiyang', 'Quanzhou', 'Qingdao', 'Yantai'];

/**
 * GET /api/cities
 * 获取城市列表（按热门城市 + 字母分组）
 */
router.get('/', (req, res) => {
    try {
        // 1. 获取热门城市（固定顺序）
        const featuredSql = `
            SELECT code, name, pinyin 
            FROM city_list 
            WHERE pinyin IN (?, ?, ?, ?, ?, ?)
              AND isdel = '0'
            ORDER BY 
                CASE pinyin 
                    WHEN ? THEN 1
                    WHEN ? THEN 2
                    WHEN ? THEN 3
                    WHEN ? THEN 4
                    WHEN ? THEN 5
                    WHEN ? THEN 6
                END
        `;

        const featuredParams = [...FEATURED_CITIES, ...FEATURED_CITIES];

        db.all(featuredSql, featuredParams, (err, featuredCities) => {
            if (err) {
                console.error('获取热门城市失败:', err);
                res.status(500).json({
                    success: false,
                    error: '获取热门城市失败'
                });
                return;
            }

            // 2. 获取其他城市（按拼音排序，排除热门城市）
            const otherSql = `
                SELECT ci.initial, cl.code, cl.name, cl.pinyin 
                FROM city_list cl
                JOIN city_initial ci ON cl.initialID = ci.listid
                WHERE cl.pinyin NOT IN (?, ?, ?, ?, ?, ?)
                  AND cl.isdel = '0'
                ORDER BY cl.pinyin ASC
            `;

            db.all(otherSql, FEATURED_CITIES, (err2, otherCities) => {
                if (err2) {
                    console.error('获取其他城市失败:', err2);
                    res.status(500).json({
                        success: false,
                        error: '获取其他城市失败'
                    });
                    return;
                }

                // 3. 按字母分组
                const alphabetical = {};
                otherCities.forEach(city => {
                    const initial = city.initial;
                    if (!alphabetical[initial]) {
                        alphabetical[initial] = [];
                    }
                    alphabetical[initial].push({
                        code: city.code,
                        name: city.name,
                        pinyin: city.pinyin
                    });
                });

                // 4. 返回结果
                res.json({
                    success: true,
                    data: {
                        featured: featuredCities,
                        alphabetical: alphabetical
                    }
                });
            });
        });
    } catch (error) {
        console.error('获取城市列表异常:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/cities/search?q=xxx
 * 搜索城市（支持中文和拼音）
 */
router.get('/search', (req, res) => {
    const query = req.query.q?.trim();

    if (!query) {
        return res.json({
            success: true,
            data: []
        });
    }

    try {
        // 同时匹配中文名和拼音
        const searchSql = `
            SELECT ci.initial, cl.code, cl.name, cl.pinyin 
            FROM city_list cl
            JOIN city_initial ci ON cl.initialID = ci.listid
            WHERE (cl.name LIKE ? OR cl.pinyin LIKE ?)
              AND cl.isdel = '0'
            ORDER BY cl.pinyin ASC
            LIMIT 50
        `;

        const searchTerm = `%${query}%`;

        db.all(searchSql, [searchTerm, searchTerm], (err, cities) => {
            if (err) {
                console.error('搜索城市失败:', err);
                res.status(500).json({
                    success: false,
                    error: '搜索城市失败'
                });
                return;
            }

            // 按字母分组搜索结果
            const grouped = {};
            cities.forEach(city => {
                const initial = city.initial;
                if (!grouped[initial]) {
                    grouped[initial] = [];
                }
                grouped[initial].push({
                    code: city.code,
                    name: city.name,
                    pinyin: city.pinyin
                });
            });

            res.json({
                success: true,
                data: grouped
            });
        });
    } catch (error) {
        console.error('搜索城市异常:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 导出模块
module.exports = {
    router,
    setDatabase
};
