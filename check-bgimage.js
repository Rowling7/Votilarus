const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/Votilarus.db');

console.log('🔍 检查图标 bgimage 字段...\n');

db.all("SELECT uuid, name, bgimage FROM A7001 WHERE isdel='0' AND bgimage IS NOT NULL LIMIT 5", (err, rows) => {
    if (err) {
        console.error('错误:', err);
        db.close();
        return;
    }
    
    console.log('📊 图标示例:');
    rows.forEach((row, i) => {
        console.log(`\n${i + 1}. ${row.name}`);
        console.log(`   UUID: ${row.uuid}`);
        console.log(`   bgimage: ${row.bgimage ? row.bgimage.substring(0, 100) + '...' : 'null'}`);
    });
    
    db.close();
});
