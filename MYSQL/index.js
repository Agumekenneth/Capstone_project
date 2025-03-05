const express = require("express");
require("dotenv").config();
const db = require("./config");

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
app.listen(port, (error) => {
    if (error) {
        console.error("Error starting server:", error);
    } else {
        console.log(`✅ Server running on port ${port}`);
    }
});

// Create Users table
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

// Create Chapters table
const sqlChapters = `CREATE TABLE IF NOT EXISTS chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
)`;
db.query(sqlChapters, (error) => {
    if (error) throw error;
    console.log("✅ Chapters table ready");
});

// Create Enrollments table
const sqlEnrollments = `CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    chapter_id INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
)`;
db.query(sqlEnrollments, (error) => {
    if (error) throw error;
    console.log("✅ Enrollments table ready");
});

// Create Activities table
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

// ✅ Route to Register a User
app.post("/register", (req, res) => {
    const { name, email, password, role } = req.body;
    const sql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
    db.query(sql, [name, email, password, role], (error, results) => {
        if (error) {
            console.error("Error registering user:", error);
            res.status(500).json({ message: "Database error" });
        } else {
            res.status(201).json({ message: "User registered", userId: results.insertId });
        }
    });
});

// ✅ Route to Enroll a Student in a Chapter
app.post("/enroll", (req, res) => {
    const { student_id, chapter_id } = req.body;
    const sql = `INSERT INTO enrollments (student_id, chapter_id) VALUES (?, ?)`;
    db.query(sql, [student_id, chapter_id], (error, results) => {
        if (error) {
            console.error("Error enrolling student:", error);
            res.status(500).json({ message: "Database error" });
        } else {
            res.status(201).json({ message: "Student enrolled", enrollmentId: results.insertId });
        }
    });
});

// ✅ Route to Add a Chapter Activity
app.post("/add-activity", (req, res) => {
    const { chapter_id, title, description, event_date } = req.body;
    const sql = `INSERT INTO activities (chapter_id, title, description, event_date) VALUES (?, ?, ?, ?)`;
    db.query(sql, [chapter_id, title, description, event_date], (error, results) => {
        if (error) {
            console.error("Error adding activity:", error);
            res.status(500).json({ message: "Database error" });
        } else {
            res.status(201).json({ message: "Activity added", activityId: results.insertId });
        }
    });
});
