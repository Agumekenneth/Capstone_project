const express = require("express");
const db = require('../MYSQL/config.js');

const router = express.Router();

// POST /enroll route
router.post("/enroll", (req, res) => {
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


router.get('/enrollments', async(req,res)=>{
    const sql = `SELECT * FROM enrollments`;
    db.query(sql,(error,results)=>{
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({message: error.message});
        }
        res.status(200).json(results);
    });
});

module.exports = router;

