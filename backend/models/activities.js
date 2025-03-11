const db = require('../MYSQL/config.js');
const sqlChapters=require('./chapters.js');
const sqlActivities = `CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chapter_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
)`;
db.query(sqlActivities, (error) => {
    if (error) throw error;
    console.log("✅ Activities table ready");
});

module.exports = sqlActivities;
