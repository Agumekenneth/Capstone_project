const db= require('../MYSQL/config.js');

// post Route to Add a Chapter Activity
app.post("/add-activity", (req, res) => {
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
        res.status(201).json({ message: "Activity added", activityId: results.insertId });
    });
});

// ✅ Route to Get All Activities
app.get("/activities", (req, res) => {
    const sql = `SELECT * FROM activities`;
    db.query(sql, (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: error.message });
        }
        res.status(200).json(results);
    });
});