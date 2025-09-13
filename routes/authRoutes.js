const express = require('express');
const AuthController = require('../controllers/authController');

const router = express.Router();
const authController = new AuthController();

console.log('[AuthRoutes] Initializing authentication routes...'); // Added for debugging

// Register a new user
router.post('/register', (req, res, next) => authController.register(req, res, next));

// Login user
router.post('/login', (req, res, next) => authController.login(req, res, next));

module.exports = router;
