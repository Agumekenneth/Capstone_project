const express = require("express");
const bcrypt = require("bcrypt");
const db= require('../MYSQL/config.js');

const router = express.Router();

router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    const allowedRoles = ["student", "president", "admin"];
    

    // Input validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
        
    }

    const userRole = allowedRoles.includes(role) ? role : "student";

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

router.get('/users', async(req,res)=>{
    const sql = `SELECT * FROM users`;
    db.query(sql,[req.params.id],(error,results)=>{
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({message: error.message});
        }
        if (results.length ===0){
            return res.status(404).json({message:"User Not found"});
        }
        res.status(200).json(results);
        res.json({message:"User found",data: results[0]});
    });
});

router.get('/users/:id', (req,res) =>{
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

router.get('/users/:email', (req,res) =>{
    const sql = `SELECT * FROM users WHERE email=?`;
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

// ✅ Route to Delete a User
router.delete("/delete-user/:id", (req, res) => {
    const userId = req.params.id;
    const sql = `DELETE FROM users WHERE id = ?`;
    db.query(sql, [userId], (error, results) => {
        if (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ message: "Database error" });
        } else if (results.affectedRows === 0) {
            res.status(404).json({ message: "User not found" });
        } else {
            res.status(200).json({ message: "User deleted successfully" });
        }
    });
});

module.exports = router; 
