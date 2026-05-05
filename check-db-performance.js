const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/Votilarus.db');

console.log('🔍 检查数据库性能...\n');

// 1. 检查表记录数
db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, tables) => {
    if (err) {
        console.error('错误:', err);
        db.close();
        return;
    }
    
    console.log('📊 表记录统计:');
    let completed = 0;
    
    tables.forEach(table => {
        const tableName = table.name;
        if (tableName.startsWith('sqlite_')) {
            completed++;
            return;
        }
        
        db.get(`SELECT COUNT(*) as count FROM "${tableName}"`, (err, row) => {
            if (err) {
                console.error(`  ❌ ${tableName}:`, err.message);
            } else {
                console.log(`  - ${tableName}: ${row.count} 条记录`);
            }
            completed++;
            
            if (completed === tables.length) {
                checkIndexes();
            }
        });
    });
});

function checkIndexes() {
    console.log('\n📑 现有索引:');
    db.all('SELECT name, tbl_name FROM sqlite_master WHERE type="index" AND name NOT LIKE "sqlite_%"', (err, indexes) => {
        if (err) {
            console.error('错误:', err);
        } else {
            if (indexes.length === 0) {
                console.log('  ⚠️ 没有自定义索引！');
            } else {
                indexes.forEach(idx => {
                    console.log(`  - ${idx.name} (表: ${idx.tbl_name})`);
                });
            }
        }
        
        testQueryPerformance();
    });
}

function testQueryPerformance() {
    console.log('\n⏱️ 查询性能测试:');
    
    // 测试分类查询
    const start1 = Date.now();
    db.all('SELECT * FROM A70 WHERE isdel = ? ORDER BY uuid ASC', ['0'], (err, rows) => {
        const time1 = Date.now() - start1;
        console.log(`  - 分类查询 (${rows.length} 条): ${time1}ms`);
        
        // 测试图标查询（所有）
        const start2 = Date.now();
        db.all('SELECT * FROM A7001 WHERE isdel = ? ORDER BY uuid ASC', ['0'], (err, rows2) => {
            const time2 = Date.now() - start2;
            console.log(`  - 图标查询-全部 (${rows2.length} 条): ${time2}ms`);
            
            // 测试布局查询
            const start3 = Date.now();
            db.all('SELECT * FROM item_layouts WHERE is_active = ? ORDER BY category_id, sort_order', ['1'], (err, rows3) => {
                const time3 = Date.now() - start3;
                console.log(`  - 布局查询 (${rows3.length} 条): ${time3}ms`);
                
                console.log('\n💡 建议:');
                if (time2 > 100) {
                    console.log('  ⚠️ 图标查询较慢，建议添加索引');
                }
                if (time3 > 100) {
                    console.log('  ⚠️ 布局查询较慢，建议添加索引');
                }
                
                createIndexesIfNeeded();
            });
        });
    });
}

function createIndexesIfNeeded() {
    console.log('\n🔧 创建优化索引...');
    
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_A70_isdel ON A70(isdel)',
        'CREATE INDEX IF NOT EXISTS idx_A7001_a70Id_isdel ON A7001(a70Id, isdel)',
        'CREATE INDEX IF NOT EXISTS idx_A7001_isdel ON A7001(isdel)',
        'CREATE INDEX IF NOT EXISTS idx_item_layouts_category_active ON item_layouts(category_id, is_active)',
        'CREATE INDEX IF NOT EXISTS idx_item_layouts_active ON item_layouts(is_active)'
    ];
    
    let completed = 0;
    indexes.forEach((sql, index) => {
        db.run(sql, (err) => {
            if (err) {
                console.log(`  ❌ 索引 ${index + 1}: ${err.message}`);
            } else {
                console.log(`  ✅ 索引 ${index + 1} 创建成功`);
            }
            completed++;
            
            if (completed === indexes.length) {
                console.log('\n✅ 索引创建完成！请重启服务器并刷新页面测试性能。');
                db.close();
            }
        });
    });
}
