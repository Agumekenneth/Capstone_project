// const express= require('express');
// const db= require('../MYSQL/config.js');

// const router = express.Router();
// // post Route to Add a Chapter Activity
// router.post("/add-activity", (req, res) => {
//     const { chapter_id, title, description, event_date } = req.body;

//     console.log("Request body:", req.body); // Debug incoming data

//     // Validate input
//     if (!chapter_id || !title || !description || !event_date) {
//         return res.status(400).json({ message: "chapter_id, title, description, and event_date are required" });
//     }
//     if (!Number.isInteger(chapter_id)) {
//         return res.status(400).json({ message: "chapter_id must be an integer" });
//     }

//     const sql = `INSERT INTO activities (chapter_id, title, description, event_date) VALUES (?, ?, ?, ?)`;
//     db.query(sql, [chapter_id, title, description, event_date], (error, results) => {
//         if (error) {
//             console.error("Error adding activity:", error);
//             // Handle specific errors
//             if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') {
//                 return res.status(400).json({ message: "Invalid chapter_id - referenced record not found" });
//             }
//             return res.status(500).json({ message: "Database error", details: error.message });
//         }

//     });
//     // Update progress after successful insertion
//     const sqlUpdate = `UPDATE chapters SET progress = LEAST(progress + 10, 100) WHERE id = ?`;
//     db.query(sqlUpdate, [chapter_id], (updateError) => {
//       if (updateError) {
//         console.error('Error updating progress:', updateError);
//         return res.status(500).json({ message: 'Error updating progress' });
//       }
//       res.status(201).json({ message: 'Activity added', activityId: results.insertId });
//     });
// });

// // ✅ Route to Get All Activities
// router.get("/activities", (req, res) => {
//     const sql = `SELECT * FROM activities`;
//     db.query(sql, (error, results) => {
//         if (error) {
//             console.error("Database error:", error);
//             return res.status(500).json({ message: error.message });
//         }
//         res.status(200).json(results);
//     });
// });

// router.get('/chapter-progress', (req, res) => {
//     const sql = `
//       SELECT 
//         c.id AS chapterId,
//         c.name,
//         c.progress,
//         a.title AS lastActivity,
//         a.event_date AS lastActivityDate
//       FROM chapters c
//       LEFT JOIN activities a ON c.id = a.chapter_id
//       AND a.event_date = (SELECT MAX(event_date) FROM activities WHERE chapter_id = c.id)
//     `;
//     db.query(sql, (error, results) => {
//       if (error) {
//         console.error('Error fetching chapter progress:', error);
//         return res.status(500).json({ message: 'Database error', details: error.message });
//       }
//       res.status(200).json(results);
//     });
//   });




// module.exports = router;

const express = require('express');
const db = require('../MYSQL/config.js');

const router = express.Router();

// POST Route to Add a Chapter Activity
router.post("/add-activity", (req, res) => {
    const { chapter_id, title, description, event_date } = req.body;

    console.log("Request body:", req.body); // Debug incoming data

    // Validate input
    if (!chapter_id || !title || !description || !event_date) {
        return res.status(400).json({ message: "chapter_id, title, description, and event_date are required" });
    }
    if (!Number.isInteger(chapter_id)) {
        return res.status(400).json({ message: "chapter_id must be an integer" });
    }

    const sql = `INSERT INTO activities (chapter_id, title, description, event_date) VALUES (?, ?, ?, ?)`;
    db.query(sql, [chapter_id, title, description, event_date], (error, results) => {
        if (error) {
            console.error("Error adding activity:", error);
            // Handle specific errors
            if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') {
                return res.status(400).json({ message: "Invalid chapter_id - referenced record not found" });
            }
            return res.status(500).json({ message: "Database error", details: error.message });
        }

        // Update progress after successful insertion
        const sqlUpdate = `UPDATE chapters SET progress = LEAST(progress + 10, 100) WHERE id = ?`;
        db.query(sqlUpdate, [chapter_id], (updateError) => {
            if (updateError) {
                console.error('Error updating progress:', updateError);
                return res.status(500).json({ message: 'Error updating progress' });
            }

            // Send response only once
            res.status(201).json({ message: 'Activity added', activityId: results.insertId });
        });
    });
});

// ✅ Route to Get All Activities
router.get("/activities", (req, res) => {
    const sql = `SELECT * FROM activities`;
    db.query(sql, (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: error.message });
        }
        res.status(200).json(results);
    });
});

// ✅ Route to Get Chapter Progress
router.get('/chapter-progress', (req, res) => {
    const sql = `
      SELECT 
        c.id AS chapterId,
        c.name,
        c.progress,
        a.title AS lastActivity,
        a.event_date AS lastActivityDate
      FROM chapters c
      LEFT JOIN activities a ON c.id = a.chapter_id
      AND a.event_date = (SELECT MAX(event_date) FROM activities WHERE chapter_id = c.id)
    `;
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching chapter progress:', error);
            return res.status(500).json({ message: 'Database error', details: error.message });
        }
        res.status(200).json(results);
    });
});

module.exports = router;