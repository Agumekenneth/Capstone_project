const mysql = require("mysql2");

// Create DB connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root", // MySQL username
    password: "", // MySQL password which is empty because root has no password in XAMPP
    database: "CSE_PLATFORM" 
});

// Connect to MySQL and create tables
db.connect((error) => {
    if (error) {
        console.error("❌ Database connection failed:", error);
    } else {
        console.log("✅ Connected to MySQL database");

        // Create Users table
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user'
            );
        `;
        db.query(createUsersTable, (err) => {
            if (err) {
                console.error("❌ Error creating users table:", err);
            } else {
                console.log("✅ Users table created successfully.");
            }
        });

        // Create Chapters table
        const createChaptersTable = `
            CREATE TABLE IF NOT EXISTS chapters (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL
            );
        `;
        db.query(createChaptersTable, (err) => {
            if (err) {
                console.error("❌ Error creating chapters table:", err);
            } else {
                console.log("✅ Chapters table created successfully.");
            }
        });

        // Create Enrollments table
        const createEnrollmentsTable = `
            CREATE TABLE IF NOT EXISTS enrollments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                chapter_id INT NOT NULL,
                FOREIGN KEY (student_id) REFERENCES users(id),
                FOREIGN KEY (chapter_id) REFERENCES chapters(id)
            );
        `;
        db.query(createEnrollmentsTable, (err) => {
            if (err) {
                console.error("❌ Error creating enrollments table:", err);
            } else {
                console.log("✅ Enrollments table created successfully.");
            }
        });

        // Create Activities table
        const createActivitiesTable = `
            CREATE TABLE IF NOT EXISTS activities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                chapter_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                event_date DATE,
                FOREIGN KEY (chapter_id) REFERENCES chapters(id)
            );
        `;
        db.query(createActivitiesTable, (err) => {
            if (err) {
                console.error("❌ Error creating activities table:", err);
            } else {
                console.log("✅ Activities table created successfully.");
            }
        });
    }
});

module.exports = db;
