const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const db = require('./MYSQL/config');
const sqlUsers = require('./models/user.js');
const sqlEnrollments = require('./models/enrollments.js');
const sqlChapters = require('./models/chapters.js');
const sqlActivities = require('./models/activities.js');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.listen(PORT,()=>{
    console.log(`Our app is running on port ${PORT}`);
});
app.get('/',(req,res) =>{
    res.send("Hello from Node API");
});



// app.post("/register", (req, res) => {
//     const { name, email, password, role } = req.body;
//     const bcrypt=require('bcrypt');
//     const sql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
//     db.query(sql, [name, email, password, role], (error, results) => {
//         if (error) {
//             console.error("Error registering user:", error);
//             res.status(500).json({ message: "Database error" });
//         } else {
//             res.status(201).json({ message: "User registered", userId: results.insertId });
//         }
//     });
// });


app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    // Input validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Validate email format (basic regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    try {
        // Hash the password
        const saltRounds = 10; // Higher = more secure but slower
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // SQL query with hashed password
        const sql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
        db.query(sql, [name, email, hashedPassword, role || 'user'], (error, results) => {
            if (error) {
                // Check for duplicate email (MySQL error code 1062 = duplicate entry)
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: "Email already registered" });
                }
                console.error("Error registering user:", error);
                return res.status(500).json({ message: "Database error" });
            }

            res.status(201).json({
                message: "User registered successfully",
                userId: results.insertId
            });
        });
    } catch (error) {
        // Catch errors from bcrypt or unexpected issues
        console.error("Error in registration process:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
});

app.get('/users', async(req,res)=>{
    const sql = `SELECT * FROM users`;
    db.query(sql,(error,results)=>{
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({message: error.message});
        }
        res.status(200).json(results);
    });
});

app.get('/users/id', (req,res) =>{
    const sql = `SELECT * FROM users WHERE id=?`;
    db.query(sql,[req.params.id], (error,results) =>{
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({message: "database error"});
        }
        if (results.length === 0) {
            return res.status(404).json({message: "User not found"});
        }
        res.json({message: "User found", data:results[0]});
    });
});




// POST /enroll route
app.post("/enroll", (req, res) => {
    const { student_id, chapter_id } = req.body;

    console.log("Request body:", req.body); // Debug incoming data

    // Validate input
    if (!student_id || !chapter_id) {
        return res.status(400).json({ message: "student_id and chapter_id are required" });
    }
    if (!Number.isInteger(student_id) || !Number.isInteger(chapter_id)) {
        return res.status(400).json({ message: "student_id and chapter_id must be integers" });
    }

    const sql = `INSERT INTO enrollments (student_id, chapter_id) VALUES (?, ?)`;
    db.query(sql, [student_id, chapter_id], (error, results) => {
        if (error) {
            console.error("Error enrolling student:", error);
            // Handle specific errors
            if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') {
                return res.status(400).json({ message: "Invalid student_id or chapter_id - referenced record not found" });
            }
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: "Student already enrolled in this chapter" });
            }
            return res.status(500).json({ message: "Database error", details: error.message });
        }
        res.status(201).json({ message: "Student enrolled", enrollmentId: results.insertId });
    });
});


app.get('/enroll', async(req,res)=>{
    const sql = `SELECT * FROM enroll`;
    db.query(sql,(error,results)=>{
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({message: error.message});
        }
        res.status(200).json(results);
    });
});




