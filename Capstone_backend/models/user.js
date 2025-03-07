const sqlUsers = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'president', 'admin') NOT NULL
)`;
db.query(sqlUsers, (error) => {
    if (error) throw error;
    console.log("✅ Users table ready");
});