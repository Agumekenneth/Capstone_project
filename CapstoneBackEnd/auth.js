const express = require('express');
const authController = require('../controllers/userAuth');
const router = express.Router();

//Route to handle sign-up
router.post('/signup',userAuth.signup);

//Route to handle sign-in
router.post('/signin',userAuth.signin);

//Route to save user data
router.post('/save-data',userAuth.saveData);

module.exports = router;