const mongoose = require('mongoose');

const aiModelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    modelIdentifier: { // Changed from apiName to modelIdentifier
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update `updatedAt` field on save
aiModelSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const AIModel = mongoose.model('AIModel', aiModelSchema);

module.exports = AIModel;
