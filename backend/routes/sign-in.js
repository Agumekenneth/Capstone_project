// sign-up.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const User = require('../models/user'); // Assuming you have a User model defined
const router = express.Router();
const db = require('../MYSQL/config.js');
require("dotenv").config();

router.post("/signin", (req, res) => {
    const { email, password } = req.body;
    

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if the user exists in MySQL database
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.query(sql, [email], async (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare hashed password
        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).json({ message: "Login successful", userId: user.id, role: user.role, token});
    });
});

module.exports = router;