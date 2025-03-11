const express = require("express");
const db= require('../MYSQL/config.js');

const router = express.Router();

// POST route to create a new chapter
router.post('/chapters', (req, res) => {
    const { name, description } = req.body;

    // Validate input
    if (!name) {
        return res.status(400).json({ error: 'Chapter name is required' });
    }

    // SQL query to insert a new chapter
    const sql = 'INSERT INTO chapters (name, description) VALUES (?, ?)';
    const values = [name, description || null]; // Use null if description is not provided

    db.query(sql, values, (error, result) => {
        if (error) {
            // Handle duplicate name error (MySQL error code 1062 for unique constraint violation)
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: `Chapter '${name}' already exists` });
            }
            console.error('Error inserting chapter:', error);
            return res.status(500).json({ error: 'Failed to create chapter' });
        }

        // Success response with the newly created chapter's ID
        res.status(201).json({
            message: 'Chapter created successfully',
            chapter: {
                id: result.insertId,
                name,
                description: description || null
            }
        });
    });
});

router.get("/chapters", (req, res) => {
    const sql = `SELECT * FROM chapters`;
    db.query(sql, (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: error.message });
        }
        res.status(200).json(results);
    });
});

module.exports = router;
