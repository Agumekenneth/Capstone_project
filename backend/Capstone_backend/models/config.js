const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "your_username", // replace with your MySQL username
    password: "joshua@54", // replace with your MySQL password
    database: "CSE_ENGAGEMENT"
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
