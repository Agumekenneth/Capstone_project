const mysql = require("mysql2");
require("dotenv").config();
const db = mysql.createConnection({
    host: "localhost",
    user: "root", // replace with your MySQL username
    password: "Lusinga@2003", // replace with your MySQL password
    database: "CSE_PLATFORM"
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
