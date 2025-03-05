const express = require('express');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

app. use(express.json());

app.listen(PORT,()=>{
    console.log(`Our app is running on port ${PORT}`);
})

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('../MYSQL/config');



