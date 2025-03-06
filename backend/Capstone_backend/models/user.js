const mysql = require('mysql2');
const dbConfig = require("./models/config");

// Create a connection to the database
const db = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: true
});

// Connect to the database
db.connect((err) => {
    if (err) throw err;
    console.log('✅ Connected to MySQL');

    // Create the users table if it doesn't exist
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
});