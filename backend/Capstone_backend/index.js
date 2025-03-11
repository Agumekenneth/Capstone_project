const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const db = require('./MYSQL/config');
const sqlUsers = require('./models/user.js');
const sqlEnrollments = require('./models/enrollments.js');
const sqlChapters = require('./models/chapters.js');
const sqlActivities = require('./models/activities.js');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.listen(PORT,()=>{
    console.log(`Our app is running on port ${PORT}`);
});
app.get('/',(req,res) =>{
    res.send("Hello from Node API");
});



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


// POST route to create a new chapter
app.post('/chapters', (req, res) => {
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

app.get("/chapters", (req, res) => {
    const sql = `SELECT * FROM chapters`;
    db.query(sql, (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ message: error.message });
        }
        res.status(200).json(results);
    });
});

// ✅ Route to Delete a User
app.delete("/delete-user/:id", (req, res) => {
    const userId = req.params.id;
    const sql = `DELETE FROM users WHERE id = ?`;
    db.query(sql, [userId], (error, results) => {
        if (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ message: "Database error" });
        } else if (results.affectedRows === 0) {
            res.status(404).json({ message: "User not found" });
        } else {
            res.status(200).json({ message: "User deleted successfully" });
        }
    });
});


const http = require('http');  // Import http module
const WebSocket = require('ws');

const server = http.createServer(app); // Create an HTTP server
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    ws.send(JSON.stringify({ message: "Welcome to WebSocket Server!" }));

    ws.on('message', (data) => {
        console.log('Received:', data.toString());

        // Example: Broadcast message to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

const sPort= 3000
server.listen(sPort,()=>{
    console.log(`Server running on port ${sPort}`);
});

//Example: Sending Websocket messages from an API route 
app.post("/notify",(req,res)=>{
    const{message} = req.body;

    if (!message) {
        return res.status(400).json({message:"Message is required"});
    }

    //Broadcast the message to all Websocket clients
    ws.clients.forEach(client =>{
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({message}));
        }
    });

    res.status(200).json({message: "notification sent to WebSocket clients"});
});