const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: mongoose.Schema.Types.Mixed, // MODIFIED: Changed type to Mixed for multimodal content
        required: true
    },
    metadata: {
        tokens: { type: Number, default: 0 },
        processingTime: { type: Number, default: 0 },
        model: { type: String, default: 'gemma2:9b' }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: false }); // Do not create _id for subdocuments

const ChatConversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    conversationId: {
        type: String,
        default: uuidv4, // Generate a unique ID for each conversation
        unique: true,
        required: true
    },
    title: {
        type: String,
        default: 'नया चैट' // Default title in Bhojpuri
    },
    summary: {
        type: String,
        default: '' // AI-generated summary of conversation
    },
    tags: [{
        type: String,
        trim: true
    }],
    language: {
        type: String,
        default: 'bhojpuri',
        enum: ['bhojpuri', 'english', 'mixed']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalMessages: {
        type: Number,
        default: 0
    },
    totalTokens: {
        type: Number,
        default: 0
    },
    messages: [MessageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
});

// Indexes for better performance
ChatConversationSchema.index({ userId: 1, updatedAt: -1 });
ChatConversationSchema.index({ conversationId: 1 });
ChatConversationSchema.index({ userId: 1, isActive: 1 });
ChatConversationSchema.index({ tags: 1 });

// Update `updatedAt` field on save
ChatConversationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    this.lastActivity = Date.now();
    this.totalMessages = this.messages.length;
    // MODIFIED: Adjust totalTokens calculation for mixed content
    this.totalTokens = this.messages.reduce((total, msg) => {
        if (Array.isArray(msg.content)) {
            // If content is an array, sum tokens from text parts
            return total + (msg.metadata?.tokens || 0);
        } else if (typeof msg.content === 'string') {
            // If content is a string, estimate tokens (simple char count for now)
            return total + Math.ceil(msg.content.length / 4); // Rough estimate
        }
        return total;
    }, 0);
    next();
});

// Method to add message with metadata
ChatConversationSchema.methods.addMessage = function (role, content, metadata = {}) {
    this.messages.push({
        role,
        content,
        metadata: {
            tokens: metadata.tokens || 0,
            processingTime: metadata.processingTime || 0,
            model: metadata.model || 'gemma2:9b'
        }
    });
    return this;
};

// Method to get conversation statistics
ChatConversationSchema.methods.getStats = function () {
    const userMessages = this.messages.filter(msg => msg.role === 'user').length;
    const assistantMessages = this.messages.filter(msg => msg.role === 'assistant').length;
    const avgResponseTime = this.messages
        .filter(msg => msg.role === 'assistant')
        .reduce((sum, msg) => sum + (msg.metadata?.processingTime || 0), 0) / assistantMessages || 0;

    return {
        totalMessages: this.messages.length,
        userMessages,
        assistantMessages,
        totalTokens: this.totalTokens,
        avgResponseTime: Math.round(avgResponseTime),
        duration: this.updatedAt - this.createdAt
    };
};

// Method to generate conversation summary
ChatConversationSchema.methods.generateSummary = function () {
    if (this.messages.length < 4) return 'छोट बातचीत'; // Short conversation

    const recentMessages = this.messages.slice(-6);
    const topics = [];

    recentMessages.forEach(msg => {
        let contentText = '';
        if (Array.isArray(msg.content)) {
            const textPart = msg.content.find(part => part.type === 'text');
            if (textPart) contentText = textPart.text;
        } else if (typeof msg.content === 'string') {
            contentText = msg.content;
        }

        if (contentText.length > 20) {
            const words = contentText.split(' ').slice(0, 3);
            topics.push(words.join(' '));
        }
    });

    return topics.length > 0 ? topics[0] + '...' : 'सामान्य बातचीत';
};

module.exports = mongoose.model('ChatConversation', ChatConversationSchema);
