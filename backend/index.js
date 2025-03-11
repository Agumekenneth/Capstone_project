const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const db = require('./MYSQL/config.js');

const sqlUsers = require('./models/user.js');
const sqlEnrollments = require('./models/enrollments.js');
const sqlChapters = require('./models/chapters.js');
const sqlActivities = require('./models/activities.js');

const app = express();
const PORT = process.env.PORT || 8080;

const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes= require('./routes/userRoute.js');
const enrollRoutes = require('./routes/enrollRoute.js');
const chapterRoutes = require('./routes/chapterRoute.js');
const activityRoutes = require('./routes/activityRoute.js');
const signinRoutes = require('./routes/sign-in.js');

app.use(cors());
app.use(bodyParser.json());

//Use the user routes
app.use("/api", userRoutes);

//Use Enrollment Routes
app.use("/api", enrollRoutes);

//Use chapter Routes
app.use("/api", chapterRoutes);

//Use activity route
app.use("/api", activityRoutes);

//Use signin route
app.use("/api",signinRoutes);

app.listen(PORT,()=>{
    console.log(`Our app is running on port ${PORT}`);
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
