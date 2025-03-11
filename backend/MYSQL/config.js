const mysql = require("mysql2");
require("dotenv").config();
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME
});

// Connect to MySQL
db.connect((error) => {
    if (error) {
        console.error("❌ Database connection failed:", error);
    } else {
        console.log("✅ Connected to MySQL database");
    }
});

module.exports = db;
