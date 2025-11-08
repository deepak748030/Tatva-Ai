const express = require('express');
const ChatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware'); // Import the protect middleware
const multer = require('multer'); // NEW: Import multer
const path = require('path');    // NEW: Import path for multer disk storage

const router = express.Router();
const chatController = new ChatController();

// NEW: Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        // Generate a unique filename using current timestamp and original extension
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Allowed image types
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: fileFilter
});

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

// MODIFIED: A4F Streaming Chat endpoint with multer middleware for image uploads
router.post('/a4f-chat/stream', protect, upload.array('images', 10), (req, res) => chatController.a4fStreamChat(req, res));

module.exports = router;
