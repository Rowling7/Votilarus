const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

// 获取所有节假日
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM holidays ORDER BY date ASC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 根据年份获取节假日
router.get('/year/:year', (req, res) => {
    const year = req.params.year;
    const sql = 'SELECT * FROM holidays WHERE year = ? ORDER BY date ASC';

    db.all(sql, [year], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 根据地区获取节假日
router.get('/region/:region', (req, res) => {
    const region = req.params.region;
    const sql = 'SELECT * FROM holidays WHERE region = ? ORDER BY date ASC';

    db.all(sql, [region], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 根据日期范围获取节假日
router.get('/range', (req, res) => {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
        return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    const sql = 'SELECT * FROM holidays WHERE date BETWEEN ? AND ? ORDER BY date ASC';

    db.all(sql, [start_date, end_date], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 获取特定日期的节假日信息
router.get('/date/:date', (req, res) => {
    const date = req.params.date;
    const sql = 'SELECT * FROM holidays WHERE date = ?';

    db.get(sql, [date], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'Holiday not found for this date' });
        }
    });
});

// 获取所有不同的年份
router.get('/years', (req, res) => {
    const sql = 'SELECT DISTINCT year FROM holidays ORDER BY year ASC';

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const years = rows.map(row => row.year);
        res.json(years);
    });
});

// 获取所有不同的地区
router.get('/regions', (req, res) => {
    const sql = 'SELECT DISTINCT region FROM holidays ORDER BY region ASC';

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const regions = rows.map(row => row.region);
        res.json(regions);
    });
});

module.exports = {
    router,
    setDatabase
};
