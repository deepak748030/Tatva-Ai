const express = require('express');
const UserController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

const router = express.Router();
const userController = new UserController();

// All user routes will be protected
router.use(protect);

// Get all users
router.get('/', (req, res, next) => userController.getAllUsers(req, res, next));

// Get a single user by ID
router.get('/:id', (req, res, next) => userController.getUserById(req, res, next));

// Update a user by ID
router.put('/:id', (req, res, next) => userController.updateUser(req, res, next));

// Delete a user by ID
router.delete('/:id', (req, res, next) => userController.deleteUser(req, res, next));

module.exports = router;
