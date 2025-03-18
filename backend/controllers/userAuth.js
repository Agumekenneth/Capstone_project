const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // ✅ This helps with form data


const JWT_SECRET = process.env.JWT_SECRET || "cisco123";
const TOKEN_EXPIRE_TIME = process.env.TOKEN_EXPIRE_TIME || "3m";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin@123"; // Secret key for admin registration

// In-memory user storage (Replace with database in production)
const users = {}; // Changed from {CSE_PLATFORM} to {}

function generateToken(username, role) {
    return jwt.sign({ sub: username, role: role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRE_TIME });
}

// 🛠️ User Registration with Role-based Authentication
app.post("/register", async (req, res) => {
    const { username, password, role, admin_secret } = req.body;

    if (users[username]) {
        return res.status(400).json({ detail: "Username already registered" });
    }

    if (role === "admin" && admin_secret !== ADMIN_SECRET) {
        return res.status(403).json({ detail: "Invalid admin secret key" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { username, password: hashedPassword, role };

    res.json({ message: "User registered successfully" });
});

// 🛠️ User Login and Token Generation
app.post("/token", async (req, res) => {
    console.log("Received login request:", req.body); // ✅ Debugging line

    const { email, password } = req.body; // ✅ Expecting email, not username

    if (!email || !password) {
        return res.status(400).json({ detail: "Email and password are required" });
    }

    const user = Object.values(users).find(u => u.email === email); // ✅ Find user by email

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ detail: "Invalid email or password" });
    }

    const accessToken = generateToken(user.email, user.role);
    res.json({ access_token: accessToken, token_type: "bearer" });
});

// 🛠️ Middleware to Authenticate Token
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ detail: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ detail: "Invalid token" });

        req.user = user;
        next();
    });
}

// 🛠️ Get Current User Details
app.get("/users/me", authenticateToken, (req, res) => {
    res.json({ username: req.user.sub, role: req.user.role });
});

// 🛠️ Get All Users (Only Admin)
app.get("/users", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ detail: "Access denied. Admins only." });
    }
    res.json({ users: Object.keys(users) });
});

// 🛠️ Get Specific User
app.get("/users/:username", (req, res) => {
    const user = users[req.params.username];
    if (!user) {
        return res.status(404).json({ detail: "User not found" });
    }
    res.json({ username: user.username, role: user.role });
});

// 🛠️ Delete a User (Only Admin)
app.delete("/users/:username", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ detail: "Access denied. Admins only." });
    }

    if (!users[req.params.username]) {
        return res.status(404).json({ detail: "User not found" });
    }

    delete users[req.params.username];
    res.json({ message: "User deleted successfully" });
});

// Start Server
app.listen(8080, () => {
    console.log("Server running on port 8080");
});
