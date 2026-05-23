const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

// 简单的认证中间件
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    // 使用简单的令牌认证，实际项目中应该使用更安全的方式如JWT
    if (token === 'ckms@9827') {
        next();
    } else {
        res.status(401).json({ error: '未授权访问' });
    }
};

// 应用认证中间件到所有管理接口
router.use(authenticate);


// 0. 自定义命令执行（极度谨慎）
router.post('/execute', (req, res) => {
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: '命令不能为空' });

    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ output: stdout || stderr });
    });
});


// 1. 系统信息查询
// 获取系统信息
router.get('/system-info', (req, res) => {
    exec('uname -a', (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ systemInfo: stdout });
    });
});

// 2.获取磁盘使用情况
router.get('/disk-usage', (req, res) => {
    exec('df -h', (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ diskUsage: stdout });
    });
});

// 3.获取内存使用情况
router.get('/memory-usage', (req, res) => {
    // 在 Android/Termux 中使用兼容方式获取内存信息
    exec('free -h 2>/dev/null || cat /proc/meminfo 2>/dev/null || echo "无法获取内存信息"', (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ memoryUsage: stdout });
    });
});

// 4. 进程管理
// 查看所有进程
router.get('/processes', (req, res) => {
    exec('ps aux', (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ processes: stdout });
    });
});

// 查看Node.js进程
router.get('/processes/node', (req, res) => {
    exec('ps aux | grep node', (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ processes: stdout });
    });
});

// 5. 文件操作
// 查看项目目录文件
router.get('/files', (req, res) => {
    exec('ls -la', (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ files: stdout });
    });
});

// 6.查看日志文件（最近100行）
router.get('/logs', (req, res) => {
    // 在 Termux/Android 环境中查找可能的日志文件
    exec('find . -name "*.log" -type f | head -n 1 | xargs tail -n 100 2>/dev/null || echo "未找到日志文件或日志文件为空"', (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ logs: stdout });
    });
});

// 7. 网络状态
// 获取网络接口信息
router.get('/network-interfaces', (req, res) => {
    exec('ip addr show 2>/dev/null || ifconfig 2>/dev/null || netstat -i 2>/dev/null || echo "无法获取网络接口信息"', (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ interfaces: stdout });
    });
});

// 查看端口占用
router.get('/port-usage/:port', (req, res) => {
    const { port } = req.params;
    // 在 Android/Termux 中使用替代命令查看端口占用
    exec(`netstat -tunlp | grep :${port} 2>/dev/null || ss -tulnp | grep :${port} 2>/dev/null || echo "未找到端口 ${port} 的占用信息"`, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ portUsage: stdout });
    });
});

// 8. 包管理
// 更新Termux包
router.post('/update-packages', (req, res) => {
    exec('pkg update && pkg upgrade -y', (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: '包更新完成', output: stdout });
    });
});

// 安装新包
router.post('/install-package', (req, res) => {
    const { packageName } = req.body;
    if (!packageName) return res.status(400).json({ error: '包名不能为空' });

    exec(`pkg install -y ${packageName}`, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: `包 ${packageName} 安装完成`, output: stdout });
    });
});

// 9. 备份与恢复
// 备份项目文件
router.post('/backup', (req, res) => {
    const backupName = `backup-${Date.now()}.tar.gz`;
    // 在 Termux 中备份当前目录
    exec(`tar -czf ${backupName} . --exclude=${backupName} 2>/dev/null || echo "备份可能已完成"`, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: '备份完成', backupFile: backupName });
    });
});

// 10. 系统维护
// 清理缓存和临时文件
router.post('/cleanup', (req, res) => {
    // 在 Android/Termux 中安全地清理缓存
    exec('pkg clean 2>/dev/null && (rm -rf /data/data/com.termux/files/usr/tmp/* 2>/dev/null || echo "临时文件清理完成")', (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: '系统清理完成', output: stdout || '清理操作已完成' });
    });
});

// 11.查看系统负载
router.get('/system-load', (req, res) => {
    // 在 Android/Termux 中查看系统负载
    exec('uptime 2>/dev/null && (cat /proc/loadavg 2>/dev/null || echo "无法获取详细负载信息")', (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ systemLoad: stdout });
    });
});

// 12. SSHD 管理
// 查看 SSHD 状态
router.get('/sshd/status', (req, res) => {
    exec('pgrep sshd > /dev/null && echo "SSHD 正在运行" || echo "SSHD 未运行"', (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ status: stdout.trim() || stderr });
    });
});

// 13.启动 SSHD 服务
router.post('/sshd/start', (req, res) => {
    exec('sshd', (error, stdout, stderr) => {
        if (error) {
            // 如果端口已被占用等错误，认为 sshd 已经在运行
            if (error.message.includes('already a pid file') || error.message.includes('Address already in use')) {
                return res.json({ message: 'SSHD 已经在运行' });
            }
            return res.status(500).json({ error: error.message });
        }
        res.json({ message: 'SSHD 启动成功', output: stdout });
    });
});

// 14.重启 SSHD 服务
router.post('/sshd/restart', (req, res) => {
    exec('pkill sshd; sleep 1; sshd', (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: 'SSHD 重启成功', output: stdout || stderr });
    });
});

module.exports = router;