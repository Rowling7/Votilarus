const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/Votilarus.db');

console.log('🔍 检查图标数据...\n');

db.all('SELECT COUNT(*) as total, COUNT(bgimage) as with_bg FROM A7001 WHERE isdel="0"', (err, rows) => {
    if (err) {
        console.error('错误:', err);
        db.close();
        return;
    }
    
    console.log('📊 图标统计:');
    console.log(`  - 总图标数: ${rows[0].total}`);
    console.log(`  - 有背景图: ${rows[0].with_bg}`);
    console.log(`  - 无背景图: ${rows[0].total - rows[0].with_bg}`);
    
    // 检查背景图路径
    db.all('SELECT bgimage FROM A7001 WHERE isdel="0" AND bgimage IS NOT NULL LIMIT 5', (err, samples) => {
        if (err) {
            console.error('错误:', err);
        } else {
            console.log('\n🖼️ 背景图示例:');
            samples.forEach((sample, i) => {
                console.log(`  ${i + 1}. ${sample.bgimage}`);
            });
        }
        
        db.close();
    });
});
