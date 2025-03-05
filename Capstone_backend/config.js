const mysql = require('mysql2/promise');
require('dotenv').config(); // Use .env variables

// Create a connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_NAME
});

// Test the connection (optional)
db.getConnection()
    .then(() => {
        console.log('Connected to MySQL!');
    })
    .catch(error => {
        console.error('Error connecting to MySQL:', error.message);
    });

module.exports = db;
