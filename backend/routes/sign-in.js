// sign-up.js

const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Assuming you have a User model defined
const router = express.Router();

// Sign-up route
router.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
        username,
        password: hashedPassword
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
});

module.exports = router;