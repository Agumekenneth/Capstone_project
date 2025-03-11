const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRE_TIME = process.env.TOKEN_EXPIRE_TIME || "3m";

// In-memory user storage (replace with a database in production)
const users = {CSE_PLATFORM};

function generateToken(username) {
    return jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRE_TIME });
}

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.status(400).json({ detail: "Username already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { username, password: hashedPassword };
    res.json({ message: "User registered successfully" });
});

app.post('/token', async (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ detail: "Invalid credentials" });
    }
    const accessToken = generateToken(username);
    res.json({ access_token: accessToken, token_type: "bearer" });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.get('/users/me', authenticateToken, (req, res) => {
    res.json({ username: req.user.sub });
});

app.get('/users', (req, res) => {
    res.json({ users: Object.keys(users) });
});

app.get('/users/:username', (req, res) => {
    const user = users[req.params.username];
    if (!user) {
        return res.status(404).json({ detail: "User not found" });
    }
    res.json({ username: user.username });
});

app.delete('/users/:username', (req, res) => {
    if (!users[req.params.username]) {
        return res.status(404).json({ detail: "User not found" });
    }
    delete users[req.params.username];
    res.json({ message: "User deleted successfully" });
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
});
