const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

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
