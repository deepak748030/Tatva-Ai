const express = require('express');
const SystemController = require('../controllers/systemController');

const router = express.Router();
const systemController = new SystemController();

// Health check endpoint
router.get('/health', (req, res) => systemController.health(req, res));

// API info endpoint
router.get('/info', (req, res) => systemController.info(req, res));

module.exports = router;