const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/Votilarus.db');

console.log('🔍 检查所有图标的 bgimage 字段...\n');

db.all("SELECT uuid, name, bgimage FROM A7001 WHERE isdel='0' LIMIT 10", (err, rows) => {
    if (err) {
        console.error('错误:', err);
        db.close();
        return;
    }
    
    console.log('📊 图标路径:');
    rows.forEach((row, i) => {
        console.log(`\n${i + 1}. ${row.name}`);
        console.log(`   UUID: ${row.uuid}`);
        console.log(`   bgimage: ${row.bgimage || 'NULL'}`);
        
        // 检查路径格式
        if (row.bgimage) {
            if (row.bgimage.includes('\\')) {
                console.log(`   ️  包含 Windows 路径分隔符`);
            }
            if (row.bgimage.startsWith('/')) {
                console.log(`   ️  以 / 开头`);
            }
        }
    });
    
    db.close();
});
