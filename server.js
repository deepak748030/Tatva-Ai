require('dotenv').config(); // Load environment variables at the very top
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose'); // Import mongoose
const path = require('path'); // NEW: Import path module
const fs = require('fs');     // NEW: Import fs module

const chatRoutes = require('./routes/chatRoutes');
const systemRoutes = require('./routes/systemRoutes');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const aiModelRoutes = require('./routes/aiModelRoutes'); // Import AI Model routes
const userRoutes = require('./routes/userRoutes'); // NEW: Import User routes
const SystemController = require('./controllers/systemController'); // Re-import to ensure it's the updated version
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { protect } = require('./middleware/authMiddleware'); // Import protect middleware

const app = express();
const PORT = process.env.PORT || 3000;
const systemController = new SystemController(); // Re-instantiate to use the updated class

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for API
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests. Please try again later.'
    }
});

// Apply rate limiting to all requests
app.use('/api/', limiter);

// Stricter rate limiting for chat endpoints (only A4F now)
const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // limit each IP to 20 chat requests per minute
    message: {
        success: false,
        error: 'Chat request limit exceeded. Please try again in a minute.'
    }
});

app.use('/api/a4f-chat', chatLimiter); // Apply to A4F non-streaming
app.use('/api/a4f-chat/stream', chatLimiter); // Apply to A4F streaming

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('🍃 MongoDB Connected Successfully!');
        console.log(`📊 Database: ${mongoose.connection.name}`);
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); // Exit process with failure
    });

// MongoDB connection event handlers
mongoose.connection.on('error', err => {
    console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
});

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NEW: Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`[Server] Created uploads directory at ${uploadsDir}`);
}

// NEW: Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadsDir));
console.log(`[Server] Serving static files from /uploads at ${uploadsDir}`);


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

// Health check endpoint for load balancers
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`🚀 Tatva AI Server is running on http://localhost:${PORT}`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/api/info`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🔑 Auth Endpoints: http://localhost:${PORT}/api/auth/register, http://localhost:${PORT}/api/auth/login`);
    console.log(`🤖 AI Model Management: http://localhost:${PORT}/api/ai-models`);
    console.log(`👤 User Management: http://localhost:${PORT}/api/users`);
    console.log(`🌐 A4F Endpoint: https://api.a4f.co/v1/chat/completions`);
    console.log(`🧠 AI Model: provider-1/chatgpt-4o-latest`);
    console.log(`🗣️ Default Language: English`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ HTTP server closed.');
        mongoose.connection.close(false, () => {
            console.log('✅ MongoDB connection closed.');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ HTTP server closed.');
        mongoose.connection.close(false, () => {
            console.log('✅ MongoDB connection closed.');
            process.exit(0);
        });
    });
});
