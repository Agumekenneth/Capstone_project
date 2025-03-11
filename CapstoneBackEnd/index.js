const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const db = require("./config"); // Adjust path if needed (e.g., "./MYSQL/config" if in same folder)

const app = express();
app.use(express.json());

const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "cisco123"; // Move to .env in production

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401); // Unauthorized
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
}

// Register a new user
app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    // Input validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
        db.query(sql, [name, email, hashedPassword, role || "user"], (error, results) => {
            if (error) {
                if (error.code === "ER_DUP_ENTRY") {
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
        console.error("Error in registration process:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// Login and generate JWT
app.post("/token", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.query(sql, [email], async (error, results) => {
        if (error) {
            console.error("Error fetching user:", error);
            return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const accessToken = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "3m" });
        res.json({ access_token: accessToken, token_type: "bearer" });
    });
});

// Update user details (with password hashing)
app.patch("/users/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // Build dynamic SQL based on provided fields
    const updates = [];
    const values = [];
    if (name !== undefined) {
        updates.push("name = ?");
        values.push(name);
    }
    if (email !== undefined) {
        updates.push("email = ?");
        values.push(email);
    }
    if (password !== undefined) {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updates.push("password = ?");
            values.push(hashedPassword);
        } catch (error) {
            console.error("Error hashing password:", error);
            return res.status(500).json({ message: "Error processing password" });
        }
    }
    if (role !== undefined) {
        updates.push("role = ?");
        values.push(role);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: "No fields provided to update" });
    }

    values.push(id); // Add ID for WHERE clause
    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

    db.query(sql, values, (error, result) => {
        if (error) {
            console.error("Error updating user:", error);
            return res.status(500).json({ message: error.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        db.query("SELECT * FROM users WHERE id = ?", [id], (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(200).json(rows[0]);
        });
    });
});

// Enroll a student in a chapter
app.post("/enroll", authenticateToken, (req, res) => {
    const { student_id, chapter_id } = req.body;
    if (!student_id || !chapter_id) {
        return res.status(400).json({ message: "Student ID and Chapter ID are required" });
    }

    const sql = `INSERT INTO enrollments (student_id, chapter_id) VALUES (?, ?)`;
    db.query(sql, [student_id, chapter_id], (error, results) => {
        if (error) {
            console.error("Error enrolling student:", error);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({ message: "Student enrolled", enrollmentId: results.insertId });
    });
});

// Add a chapter activity
app.post("/add-activity", authenticateToken, (req, res) => {
    const { chapter_id, title, description, event_date } = req.body;
    if (!chapter_id || !title || !event_date) {
        return res.status(400).json({ message: "Chapter ID, title, and event date are required" });
    }

    const sql = `INSERT INTO activities (chapter_id, title, description, event_date) VALUES (?, ?, ?, ?)`;
    db.query(sql, [chapter_id, title, description || null, event_date], (error, results) => {
        if (error) {
            console.error("Error adding activity:", error);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({ message: "Activity added", activityId: results.insertId });
    });
});

// Start the server
app.listen(port, (error) => {
    if (error) {
        console.error("Error starting server:", error);
    } else {
        console.log(`✅ Server running on port ${port}`);
    }
});