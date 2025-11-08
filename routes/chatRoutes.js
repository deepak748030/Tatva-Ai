const express = require('express');
const ChatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware'); // Import the protect middleware

const router = express.Router();
const chatController = new ChatController();

// Get all conversations for the authenticated user
router.get('/chat/history', protect, (req, res) => chatController.getConversations(req, res));

// Get a specific conversation by ID for the authenticated user
router.get('/chat/history/:conversationId', protect, (req, res) => chatController.getConversationById(req, res));

// Delete a conversation by ID for the authenticated user
router.delete('/chat/history/:conversationId', protect, (req, res) => chatController.deleteConversation(req, res));

// Get conversation statistics for the authenticated user
router.get('/chat/stats', protect, (req, res) => chatController.getConversationStats(req, res));

// A4F Chat endpoints (require authentication and save history)
router.post('/a4f-chat', protect, (req, res) => chatController.a4fChat(req, res));
router.post('/a4f-chat/stream', protect, (req, res) => chatController.a4fStreamChat(req, res));

module.exports = router;
