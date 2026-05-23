// ==================== Termux SSHD 管理路由 ====================
const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

// 认证令牌
const AUTH_TOKEN = 'ckms@9827';

// 认证中间件
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === AUTH_TOKEN) {
        next();
    } else {
        res.status(401).json({ error: '未授权访问' });
    }
};

router.use(authenticate);

// SSHD 状态查询
router.get('/sshd/status', (req, res) => {
    exec('pgrep sshd > /dev/null && echo "running" || echo "stopped"', (error, stdout, stderr) => {
        if (error) {
            // pgrep 未找到进程也返回 stopped
            if (error.code === 1) {
                return res.json({ status: 'stopped', message: 'SSHD 未运行' });
            }
            return res.status(500).json({ error: error.message });
        }
        const status = stdout.trim();
        res.json({ 
            status: status, 
            message: status === 'running' ? 'SSHD 正在运行' : 'SSHD 未运行' 
        });
    });
});

// 启动 SSHD
router.post('/sshd/start', (req, res) => {
    // 先检查是否已在运行
    exec('pgrep sshd > /dev/null && echo "running" || echo "stopped"', (checkErr, checkStdout) => {
        if (!checkErr && checkStdout.trim() === 'running') {
            return res.json({ success: true, message: 'SSHD 已在运行' });
        }

        exec('sshd', (error, stdout, stderr) => {
            if (error) {
                if (error.message.includes('already a pid file') || error.message.includes('Address already in use')) {
                    return res.json({ success: true, message: 'SSHD 已在运行' });
                }
                return res.status(500).json({ success: false, error: error.message });
            }
            res.json({ success: true, message: 'SSHD 启动成功' });
        });
    });
});

// 重启 SSHD
router.post('/sshd/restart', (req, res) => {
    exec('pkill sshd; sleep 1; sshd', (error, stdout, stderr) => {
        if (error) return res.status(500).json({ success: false, error: error.message });
        res.json({ success: true, message: 'SSHD 重启成功' });
    });
});

module.exports = router;