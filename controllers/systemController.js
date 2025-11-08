const A4FModel = require('../models/A4FModel');

class SystemController {
    constructor() {
        this.a4fModel = new A4FModel();
    }

    health(req, res) {
        res.json({
            status: 'OK',
            message: 'Tatva AI Server is running!',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            language: 'English (default), Bhojpuri'
        });
    }

    async info(req, res) {
        let a4fStatus = 'unknown';

        // Check A4F health
        try {
            const a4fHealth = await this.a4fModel.checkA4FHealth();
            a4fStatus = a4fHealth.status;
        } catch (error) {
            a4fStatus = 'error';
        }

        res.json({
            name: 'Tatva AI API Server',
            description: 'Bilingual AI assistant - specializing in English and Bhojpuri',
            version: '2.0.0',
            a4f: {
                endpoint: 'https://api.a4f.co/v1/chat/completions',
                model: 'provider-1/chatgpt-4o-latest',
                status: a4fStatus
            },
            endpoints: {
                'POST /api/a4f-chat': 'A4F Chat Endpoint - with advanced AI models',
                'POST /api/a4f-chat/stream': 'A4F Streaming Chat - real-time A4F responses',
                'GET /api/chat/history': 'List all conversations (protected)',
                'GET /api/chat/history/:id': 'View a specific conversation (protected)',
                'DELETE /api/chat/history/:id': 'Delete a conversation (protected)',
                'GET /api/chat/stats': 'Conversation statistics (protected)',
                'GET /api/health': 'Server health check',
                'GET /api/info': 'API information',
                'POST /api/auth/register': 'New user registration',
                'POST /api/auth/login': 'User login',
                'POST /api/ai-models': 'Create a new AI model (protected)',
                'GET /api/ai-models': 'View all AI models (protected)',
                'GET /api/ai-models/:id': 'View a specific AI model (protected)',
                'PUT /api/ai-models/:id': 'Update an AI model (protected)',
                'DELETE /api/ai-models/:id': 'Delete an AI model (protected)',
                'GET /api/users': 'View all users (protected)',
                'GET /api/users/:id': 'View a specific user (protected)',
                'PUT /api/users/:id': 'Update a user (protected)',
                'DELETE /api/users/:id': 'Delete a user (protected)'
            },
            languages: ['English', 'Bhojpuri'],
            origin: 'Bihar, India',
            features: [
                'Advanced conversation history management',
                'Real-time streaming chat',
                'Bhojpuri language expertise',
                'A4F API integration - advanced AI models',
                'Secure user authentication',
                'Conversation statistics and analysis'
            ]
        });
    }

    root(req, res) {
        res.json({
            message: 'Hello! Welcome to Tatva AI API Server',
            description: 'Your bilingual AI assistant from Bihar, India',
            documentation: 'Visit /api/info for API documentation',
            version: '2.0.0',
            greeting: 'Hello! How can Tatva assist you today?'
        });
    }
}

module.exports = SystemController;

