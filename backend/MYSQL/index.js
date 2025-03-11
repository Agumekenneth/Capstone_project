const express = require("express");
require("dotenv").config();
const db = require("./config");

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
app.listen(port, (error) => {
    if (error) {
        console.error("Error starting server:", error);
    } else {
        console.log(`✅ Server running on port ${port}`);
    }
});
