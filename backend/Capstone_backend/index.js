const express = require('express');
require("dotenv").config();
const sqlUsers = require('./models/user.js')

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.listen(PORT,()=>{
    console.log(`Our app is running on port ${PORT}`);
});
app.get('/',(req,res) =>{
    res.send("Hello from Node API");
});

app.post('/api/products',(req,res)=>{
    try{

    } catch(error) {
        res.status(500).json({message: error.message});

    }
});
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('./MYSQL/config');




