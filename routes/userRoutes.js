const express = require('express');
const UserController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const userController = new UserController();

// All user routes will be protected
router.use(protect);

// NEW: Get all available subscription plans - THIS MUST BE BEFORE /:id
router.get('/subscriptions', (req, res, next) => userController.getSubscriptionPlans(req, res, next));

// Get authenticated user's usage information
router.get('/me/token-balance', (req, res, next) => userController.getTokenBalance(req, res, next));

// Get all users
router.get('/', (req, res, next) => userController.getAllUsers(req, res, next));

// Get a single user by ID
router.get('/:id', (req, res, next) => userController.getUserById(req, res, next));

// Update a user by ID
router.put('/:id', (req, res, next) => userController.updateUser(req, res, next));

// Delete a user by ID
router.delete('/:id', (req, res, next) => userController.deleteUser(req, res, next));

// NEW: Subscribe user to a plan
router.put('/:id/subscribe', (req, res, next) => userController.subscribeUser(req, res, next));

module.exports = router;

