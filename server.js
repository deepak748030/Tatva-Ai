require('dotenv').config(); // Load environment variables at the very top
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Import mongoose
const chatRoutes = require('./routes/chatRoutes');
const systemRoutes = require('./routes/systemRoutes');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const aiModelRoutes = require('./routes/aiModelRoutes'); // Import AI Model routes
const userRoutes = require('./routes/userRoutes'); // NEW: Import User routes
const SystemController = require('./controllers/systemController');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { protect } = require('./middleware/authMiddleware'); // Import protect middleware

const app = express();
const PORT = process.env.PORT || 3000;
const systemController = new SystemController();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🍃 MongoDB Connected Successfully!'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); // Exit process with failure
    });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Diagnostic log for authRoutes
console.log('[Server] Auth routes module loaded. Is it an Express Router?', typeof authRoutes === 'function' && authRoutes.stack && authRoutes.stack.length > 0);

// Routes
// IMPORTANT: Moving auth routes up to ensure they are processed early
app.use('/api/auth', authRoutes); // Moved this line up to prioritize auth routes
app.use('/api', chatRoutes);
app.use('/api', systemRoutes);
app.use('/api/ai-models', protect, aiModelRoutes); // AI Model routes are protected
app.use('/api/users', protect, userRoutes); // NEW: User CRUD routes are protected

// Root endpoint
app.get('/', (req, res) => systemController.root(req, res));

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Tatva AI Server is running on http://localhost:${PORT}`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/api/info`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🔑 Auth Endpoints: http://localhost:${PORT}/api/auth/register, http://localhost:${PORT}/api/auth/login`);
    console.log(`🤖 AI Model Management: http://localhost:${PORT}/api/ai-models`);
    console.log(`👤 User Management: http://localhost:${PORT}/api/users`);
});
