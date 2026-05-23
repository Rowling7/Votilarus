const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// 缩略图缓存目录
const CACHE_DIR = path.join(__dirname, '..', 'data', 'thumbnail_cache');

// 确保缓存目录存在
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * GET /api/thumbnail?src=static/background/backImage/image001.png&w=96
 * 生成并返回缩略图（宽度96px, 质量10%）
 * 参数:
 *   - src: 相对于项目根目录的图片路径
 *   - w: 缩略图宽度（默认96）
 */
router.get('/', async (req, res) => {
    try {
        const src = req.query.src;
        const width = parseInt(req.query.w) || 96;

        if (!src) {
            return res.status(400).json({ error: '缺少 src 参数' });
        }

        // 安全检查：只允许特定目录下的图片
        const allowedDirs = ['static/background/backImage/'];
        const isAllowed = allowedDirs.some(dir => src.startsWith(dir));
        if (!isAllowed) {
            return res.status(403).json({ error: '禁止访问该路径' });
        }

        const fullPath = path.join(__dirname, '..', 'public', src);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: '文件不存在' });
        }

        // 生成缓存文件名（基于路径和宽度的 hash）
        const cacheKey = `${src.replace(/[/\\]/g, '_')}_w${width}.webp`;
        const cachePath = path.join(CACHE_DIR, cacheKey);

        // 检查缓存
        if (fs.existsSync(cachePath)) {
            res.setHeader('Content-Type', 'image/webp');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.sendFile(cachePath);
        }

        // 使用 sharp 生成缩略图 (10% 质量 = quality: 10)
        await sharp(fullPath)
            .resize(width, null, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 10 })
            .toFile(cachePath);

        res.setHeader('Content-Type', 'image/webp');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(cachePath);
    } catch (err) {
        console.error('缩略图生成失败:', err.message);
        res.status(500).json({ error: '缩略图生成失败' });
    }
});

module.exports = { router };