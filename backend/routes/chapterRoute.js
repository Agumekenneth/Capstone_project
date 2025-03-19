// const express = require("express");
// const db= require('../MYSQL/config.js');

// const router = express.Router();

// // POST route to create a new chapter
// router.post('/chapters', (req, res) => {
//     const { name, description } = req.body;

//     // Validate input
//     if (!name) {
//         return res.status(400).json({ error: 'Chapter name is required' });
//     }

//     // SQL query to insert a new chapter
//     const sql = 'INSERT INTO chapters (name, description) VALUES (?, ?)';
//     const values = [name, description || null]; // Use null if description is not provided

//     db.query(sql, values, (error, result) => {
//         if (error) {
//             // Handle duplicate name error (MySQL error code 1062 for unique constraint violation)
//             if (error.code === 'ER_DUP_ENTRY') {
//                 return res.status(409).json({ error: `Chapter '${name}' already exists` });
//             }
//             console.error('Error inserting chapter:', error);
//             return res.status(500).json({ error: 'Failed to create chapter' });
//         }

//         // Success response with the newly created chapter's ID
//         res.status(201).json({
//             message: 'Chapter created successfully',
//             chapter: {
//                 id: result.insertId,
//                 name,
//                 description: description || null
//             }
//         });
//     });
// });

// router.get("/chapters", (req, res) => {
//     const sql = `SELECT * FROM chapters`;
//     db.query(sql, (error, results) => {
//         if (error) {
//             console.error("Database error:", error);
//             return res.status(500).json({ message: error.message });
//         }
//         res.status(200).json(results);
//     });
// });

// module.exports = router; 

const express = require("express");
const db = require('../MYSQL/config.js');

const router = express.Router();

// POST route to create a new chapter
router.post('/chapters', (req, res) => {
    const { name, description, data } = req.body;

    // Validate input
    if (!name) {
        return res.status(400).json({ error: 'Chapter name is required' });
    }

    // SQL query to insert a new chapter
    const sql = 'INSERT INTO chapters (name, description, data) VALUES (?, ?, ?)';
    const values = [name, description || null, data ? JSON.stringify(data) : null]; // Use null if description or data is not provided

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
                description: description || null,
                data: data || null
            }
        });
    });
});

// GET route to fetch all chapters
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

// GET route to fetch a specific chapter by name
router.get("/chapters/:name", (req, res) => {
    const { name } = req.params;
    const sql = `SELECT * FROM chapters WHERE name = ?`;
    db.query(sql, [name], (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Chapter not found' });
        }
        res.status(200).json(results[0]);
    });
});

// PUT route to update a chapter's data
router.put("/chapters/:name", (req, res) => {
    const { name } = req.params;
    const { description, data } = req.body;

    // Validate input
    if (!description && !data) {
        return res.status(400).json({ error: 'Description or data is required for update' });
    }

    // Build the SQL query dynamically based on provided fields
    let sql = 'UPDATE chapters SET ';
    const values = [];
    if (description) {
        sql += 'description = ?, ';
        values.push(description);
    }
    if (data) {
        sql += 'data = ?, ';
        values.push(JSON.stringify(data));
    }
    sql = sql.slice(0, -2); // Remove the trailing comma and space
    sql += ' WHERE name = ?';
    values.push(name);

    db.query(sql, values, (error, result) => {
        if (error) {
            console.error('Error updating chapter:', error);
            return res.status(500).json({ error: 'Failed to update chapter' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `Chapter '${name}' not found` });
        }
        res.status(200).json({ message: 'Chapter updated successfully' });
    });
});

// DELETE route to delete a chapter by name
router.delete("/chapters/:name", (req, res) => {
    const { name } = req.params;
    const sql = `DELETE FROM chapters WHERE name = ?`;
    db.query(sql, [name], (error, result) => {
        if (error) {
            console.error('Error deleting chapter:', error);
            return res.status(500).json({ error: 'Failed to delete chapter' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `Chapter '${name}' not found` });
        }
        res.status(200).json({ message: 'Chapter deleted successfully' });
    });
});

module.exports = router;
