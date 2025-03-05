const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "joshua@54",
    database: "" // created this database in phpMyAdmin
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
