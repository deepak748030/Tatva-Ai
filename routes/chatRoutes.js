const express = require('express');
const ChatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware'); // Import the protect middleware

const router = express.Router();
const chatController = new ChatController();

// Main chat endpoint (requires authentication and saves history)
router.post('/chat', protect, (req, res) => chatController.chat(req, res));

// Streaming chat endpoint (requires authentication and saves history)
router.post('/chat/stream', protect, (req, res) => chatController.streamChat(req, res));

// Get all conversations for the authenticated user
router.get('/chat/history', protect, (req, res) => chatController.getConversations(req, res));

// Get a specific conversation by ID for the authenticated user
router.get('/chat/history/:conversationId', protect, (req, res) => chatController.getConversationById(req, res));

// Simple chat endpoint (does NOT require authentication and does NOT save history)
router.post('/simple-chat', (req, res) => chatController.simpleChat(req, res));

module.exports = router;
