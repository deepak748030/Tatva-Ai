const express = require('express');
const AIModelController = require('../controllers/aiModelController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const aiModelController = new AIModelController();

// Protect all AI model routes (assuming authentication is desired for management)
router.use(protect);

// Create a new AI Model
router.post('/', aiModelController.createAIModel);

// Get all AI Models
router.get('/', aiModelController.getAllAIModels);

// Get a single AI Model by ID
router.get('/:id', aiModelController.getAIModelById);

// Update an AI Model by ID
router.put('/:id', aiModelController.updateAIModel);

// Delete an AI Model by ID
router.delete('/:id', aiModelController.deleteAIModel);

module.exports = router;
