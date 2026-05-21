const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

/**
 * GET /api/worktime/config
 * 获取工作时间和薪资配置
 * 根据当前日期自动判断使用DST还是ST配置
 */
router.get('/config', (req, res) => {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() 返回 0-11
    const day = now.getDate();

    // DST: 5月1日至9月30日
    let workTimeType = 'ST';
    if ((month === 5 && day >= 1) ||
        (month > 5 && month < 9) ||
        (month === 9 && day <= 30)) {
        workTimeType = 'DST';
    }

    // 查询对应类型的配置
    const sql = 'SELECT starttime, lunchtime, endtime, dailysalary, type FROM worktime WHERE type = ? AND isdel = ? LIMIT 1';

    db.get(sql, [workTimeType, '0'], (err, row) => {
        if (err) {
            res.status(500).json({
                success: false,
                error: err.message
            });
            return;
        }

        if (!row) {
            res.status(404).json({
                success: false,
                error: '未找到工作时间配置'
            });
            return;
        }

        res.json({
            success: true,
            data: {
                startTime: row.starttime,
                lunchTime: row.lunchtime,
                endTime: row.endtime,
                dailySalary: parseFloat(row.dailysalary),
                type: row.type
            }
        });
    });
});

module.exports = {
    router,
    setDatabase
};
