

const sqlChapters = `CREATE TABLE IF NOT EXISTS chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
)`;
db.query(sqlChapters, (error) => {
    if (error) throw error;
    console.log("✅ Chapters table ready");
});

module.exports= sqlChapters;