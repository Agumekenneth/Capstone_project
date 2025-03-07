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

app.get('/register', async(req,res)=>{
    try{
        const users= await user.find({});
        res.status(200).json(users);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
});






