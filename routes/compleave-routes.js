const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

const crypto = require('crypto');

/**
 * POST /api/compleave/add
 * 新增加班或调休记录
 */
router.post('/add', (req, res) => {
    const { name, hours, minutes, type, date } = req.body;

    // 参数校验
    if (!name || hours === undefined || hours === null || minutes === undefined || minutes === null || !type || !date) {
        return res.status(400).json({
            success: false,
            error: '缺少必要参数：name, hours, minutes, type, date'
        });
    }

    // 类型校验：只允许 '1'（加班）或 '-1'（调休）
    if (type !== '1' && type !== '-1') {
        return res.status(400).json({
            success: false,
            error: '类型参数无效，必须为 "1"（加班）或 "-1"（调休）'
        });
    }

    // 数值校验
    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);

    if (isNaN(hoursNum) || isNaN(minutesNum) || hoursNum < 0 || minutesNum < 0 || minutesNum > 59) {
        return res.status(400).json({
            success: false,
            error: '时长格式无效：小时必须为非负整数，分钟必须为 0-59 之间的整数'
        });
    }

    // 时长不能同时为 0
    if (hoursNum === 0 && minutesNum === 0) {
        return res.status(400).json({
            success: false,
            error: '时长不能为 0'
        });
    }

    const id = crypto.randomUUID();

    const sql = 'INSERT INTO compleave (id, name, hours, minutes, date, type, isdel) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.run(sql, [id, name, hoursNum, minutesNum, date, type, '0'], function (err) {
        if (err) {
            console.error('新增加班调休记录失败:', err);
            return res.status(500).json({
                success: false,
                error: '新增记录失败'
            });
        }

        const typeName = type === '1' ? '加班' : '调休';
        res.json({
            success: true,
            message: `${typeName}记录添加成功`,
            data: {
                id,
                name,
                hours: hoursNum,
                minutes: minutesNum,
                type,
                date
            }
        });
    });
});

/**
 * GET /api/compleave/config
 * 获取加班调休配置
 * 实时计算 type='1'（加班）和 type='-1'（调休）的总和
 */
router.get('/config', (req, res) => {
    // 查询所有未删除的加班记录（type='1'）
    const overtimeSql = 'SELECT SUM(hours) as totalHours, SUM(minutes) as totalMinutes FROM compleave WHERE type = ? AND isdel = ?';

    // 查询所有未删除的调休记录（type='-1'）
    const leaveSql = 'SELECT SUM(hours) as totalHours, SUM(minutes) as totalMinutes FROM compleave WHERE type = ? AND isdel = ?';

    db.get(overtimeSql, ['1', '0'], (err, overtimeRow) => {
        if (err) {
            console.error('查询加班记录失败:', err);
            return res.status(500).json({
                success: false,
                error: '查询加班记录失败'
            });
        }

        db.get(leaveSql, ['-1', '0'], (err, leaveRow) => {
            if (err) {
                console.error('查询调休记录失败:', err);
                return res.status(500).json({
                    success: false,
                    error: '查询调休记录失败'
                });
            }

            // 处理空值情况
            const overtimeHours = overtimeRow?.totalHours || 0;
            const overtimeMinutes = overtimeRow?.totalMinutes || 0;
            const leaveHours = leaveRow?.totalHours || 0;
            const leaveMinutes = leaveRow?.totalMinutes || 0;

            // 转换为总分钟数进行计算
            const totalOvertimeMinutes = overtimeHours * 60 + overtimeMinutes;
            const totalLeaveMinutes = leaveHours * 60 + leaveMinutes;

            // 计算可调休时间（加班 - 调休）
            let availableMinutes = totalOvertimeMinutes - totalLeaveMinutes;

            // 如果可调休时间为负数，设为0
            if (availableMinutes < 0) {
                availableMinutes = 0;
            }

            // 转换回小时和分钟
            const availableHours = Math.floor(availableMinutes / 60);
            const availableRemainingMinutes = availableMinutes % 60;

            res.json({
                success: true,
                data: {
                    overtimeHours,
                    overtimeMinutes,
                    leaveHours,
                    leaveMinutes,
                    availableHours,
                    availableMinutes: availableRemainingMinutes
                }
            });
        });
    });
});

module.exports = {
    router,
    setDatabase
};
