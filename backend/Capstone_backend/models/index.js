
app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    // Input validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }

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



//Rote to update users
app.patch('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // Build dynamic SQL based on provided fields
    const updates = [];
    const values = [];
    if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
    }
    if (email !== undefined) {
        updates.push('email = ?');
        values.push(email);
    }
    if (password !== undefined) {
        updates.push('password= ?');
        values.push(password);
    }
    if (role !== undefined) {
        updates.push('role= ?');
        values.push(role);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields provided to update' });
    }

    values.push(id); // Add ID for WHERE clause
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

    db.query(sql, values, (error, result) => {
        if (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ message: error.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        db.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(200).json(rows[0]);
        });
    });
});

