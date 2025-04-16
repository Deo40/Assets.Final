const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// No need for apiKeyAuth here for login/register
router.post('/register', register);
router.post('/login', login);

module.exports = router;
