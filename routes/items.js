const express = require('express');
const router = express.Router();

// 需要注入 db 对象
let db;

// 设置数据库连接
function setDatabase(database) {
    db = database;
}

// 获取分类下的图标
router.get('/', (req, res) => {
    const categoryUuid = req.query.category_uuid;
    
    console.log('🔍 [API] 请求图标列表');
    console.log('  - category_uuid 参数:', categoryUuid);
    console.log('  - 参数类型:', typeof categoryUuid);
    
    let sql = 'SELECT * FROM A7001 WHERE isdel = ?';
    const params = ['0'];
    
    if (categoryUuid !== undefined && categoryUuid !== null) {
        sql += ' AND a70Id = ?';
        const convertedUuid = parseInt(categoryUuid);
        console.log('  - 转换后的 a70Id:', convertedUuid);
        console.log('  - 转换类型:', typeof convertedUuid);
        params.push(convertedUuid);
    } else {
        console.log('  - ⚠️ 未提供 category_uuid，返回所有图标');
    }
    
    console.log('  - SQL 查询:', sql);
    console.log('  - 参数:', params);
    
    sql += ' ORDER BY uuid ASC';
    console.log('  - 最终 SQL:', sql);
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('  - ❌ 查询错误:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        console.log('  - ✅ 查询结果数量:', rows.length);
        if (rows.length > 0) {
            console.log('  - 第一条记录:', {
                uuid: rows[0].uuid,
                a70Id: rows[0].a70Id,
                name: rows[0].name
            });
        }
        res.json(rows);
    });
});

module.exports = {
    router,
    setDatabase
};
