app.post("/register", (req, res) => {
    const { name, email, password, role } = req.body;
    const sql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
    db.query(sql, [name, email, password, role], (error, results) => {
        if (error) {
            console.error("Error registering user:", error);
            res.status(500).json({ message: "Database error" });
        } else {
            res.status(201).json({ message: "User registered", userId: results.insertId });
        }
    });
});