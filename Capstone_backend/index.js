const express = require('express');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

app. use(express.json());

app.listen(PORT,()=>{
    console.log(`Our app is running on port ${PORT}`);
})

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const initializeDB = require('./config');

async function startServer() {
    try {
        // Wait for DB connection
        const db = await initializeDB;

        // Create table using Promise syntax
        const sqlCreate = `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            First_name VARCHAR(50),
            Last_name VARCHAR(50),
            role ENUM('student','president','HOD') DEFAULT 'student',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        await db.query(sqlCreate);
        console.log('Table created or already exists');

        app.post('/add-student', async (req, res) => {
            const { email, password, First_name, Last_name } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                const sql = `INSERT INTO users (email, password, First_name, Last_name) VALUES (?, ?, ?, ?)`;
                const [results] = await db.query(sql, [email, hashedPassword, First_name, Last_name]);
                console.log(`Inserted user with ID: ${results.insertId}`);
                res.status(201).json({ message: 'Student added successfully', id: results.insertId });
            } catch (error) {
                console.error('Insert error:', error.message);
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Email already registered' });
                }
                res.status(500).json({ error: 'Failed to add student', details: error.message });
            }
        })
    }

};


