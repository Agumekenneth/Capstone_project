const mysql = require('mysql2/promise');
require('dotenv').config(); // Use .env variables

// Create a connection pool
async function initializeDB() {
    const db = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER ,
        password: process.env.DB_PASSWORD ,
        database: process.env.DB_NAME
    });

    try {
        await db.getConnection();
        console.log('Connected to MySQL!');
        return db;
    } catch(error) {
        console.log('Error connecting to MySQL:',error.message);
        throw error;
    }
}
module.exports = initializeDB;
