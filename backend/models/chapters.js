const db= require('../MYSQL/config.js');

const sqlChapters = `CREATE TABLE IF NOT EXISTS chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    progress INT DEFAULT 0,
    data JSON
)`;
db.query(sqlChapters, (error) => {
    if (error) throw error;
    console.log("✅ Chapters table ready");
});

// const sqlAlterChapters = `
//   ALTER TABLE chapters
//   ADD COLUMN progress INT DEFAULT 0
// `;
// db.query(sqlAlterChapters, (error) => {
//   if (error) throw error;
//   console.log('✅ Progress column added to chapters table');
// });

// const sqlAlterChaptersTable = `
//     ALTER TABLE chapters
//     ADD COLUMN data JSON
// `;
// db.query(sqlAlterChaptersTable, (error) => {
//     if (error) throw error;
//     console.log('✅ Data column added to chapters table');
// });

module.exports= sqlChapters;