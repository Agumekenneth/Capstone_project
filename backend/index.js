const express = require('express');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>{
    console.log(`Our app is running on port ${PORT}`);

})



const bcrypt =require('bcrypt');
const jwt = require('jsonwebtoken')

app.post('/register',async (req, res)=>{
    const{name,email,password}= req.body;

    if (!email || !password){
        return res.status(400).json({error:"Your email and password are required to register"});
    }
   
});