class SystemController {
    health(req, res) {
        res.json({
            status: 'OK',
            message: 'Tatva AI Server is running!',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        });
    }

    info(req, res) {
        res.json({
            name: 'Tatva AI API Server',
            description: 'Bilingual AI assistant specializing in English and Bhojpuri languages',
            endpoints: {
                'POST /api/chat': 'Main chat endpoint with conversation history support',
                'POST /api/chat/stream': 'Streaming chat endpoint with real-time responses',
                'POST /api/simple-chat': 'Simple chat endpoint for basic usage',
                'GET /api/health': 'Server health check',
                'GET /api/info': 'API information',
                'POST /api/auth/register': 'Register a new user - Requires { email: "string", password: "string", phoneNumber: "string" }',
                'POST /api/auth/login': 'Authenticate user and get JWT token - Requires { email: "string", password: "string" }',
                'POST /api/ai-models': 'Create a new AI model (Protected) - Requires { name: "string", modelIdentifier: "string" }',
                'GET /api/ai-models': 'Get all AI models (Protected)',
                'GET /api/ai-models/:id': 'Get a single AI model by ID (Protected)',
                'PUT /api/ai-models/:id': 'Update an AI model by ID (Protected) - Requires { name?: "string", modelIdentifier?: "string" }',
                'DELETE /api/ai-models/:id': 'Delete an AI model by ID (Protected)',
                'GET /api/users': 'Get all users (Protected)', // NEW: User CRUD documentation
                'GET /api/users/:id': 'Get a single user by ID (Protected)',
                'PUT /api/users/:id': 'Update a user by ID (Protected) - Requires { email?: "string", phoneNumber?: "string", password?: "string" }',
                'DELETE /api/users/:id': 'Delete a user by ID (Protected)'
            },
            languages: ['English', 'Bhojpuri'],
            origin: 'Bihar, India'
        });
    }

    root(req, res) {
        res.json({
            message: 'नमस्कार! Welcome to Tatva AI API Server',
            description: 'Your bilingual AI assistant from Bihar, India',
            documentation: 'Visit /api/info for API documentation'
        });
    }
}

module.exports = SystemController;
