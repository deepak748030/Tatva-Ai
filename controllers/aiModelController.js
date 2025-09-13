const AIModel = require('../models/AIModel');

class AIModelController {
    // Create a new AI Model
    async createAIModel(req, res, next) {
        try {
            const { name, modelIdentifier } = req.body; // Changed from apiName to modelIdentifier
            if (!name || !modelIdentifier) { // Changed from apiName to modelIdentifier
                return res.status(400).json({ message: 'Name and modelIdentifier are required.' });
            }

            const newAIModel = new AIModel({ name, modelIdentifier }); // Changed from apiName to modelIdentifier
            await newAIModel.save();
            res.status(201).json({ message: 'AI Model created successfully', model: newAIModel });
        } catch (error) {
            if (error.code === 11000) { // Duplicate key error
                return res.status(409).json({ message: 'AI Model with this name or modelIdentifier already exists.' }); // Changed from apiName to modelIdentifier
            }
            next(error);
        }
    }

    // Get all AI Models
    async getAllAIModels(req, res, next) {
        try {
            const models = await AIModel.find({});
            res.status(200).json(models);
        } catch (error) {
            next(error);
        }
    }

    // Get a single AI Model by ID
    async getAIModelById(req, res, next) {
        try {
            const { id } = req.params;
            const model = await AIModel.findById(id);
            if (!model) {
                return res.status(404).json({ message: 'AI Model not found.' });
            }
            res.status(200).json(model);
        } catch (error) {
            next(error);
        }
    }

    // Update an AI Model by ID
    async updateAIModel(req, res, next) {
        try {
            const { id } = req.params;
            const { name, modelIdentifier } = req.body; // Changed from apiName to modelIdentifier
            if (!name && !modelIdentifier) { // Changed from apiName to modelIdentifier
                return res.status(400).json({ message: 'At least one field (name or modelIdentifier) is required for update.' }); // Changed from apiName to modelIdentifier
            }

            const updatedModel = await AIModel.findByIdAndUpdate(
                id,
                { name, modelIdentifier, updatedAt: Date.now() }, // Changed from apiName to modelIdentifier
                { new: true, runValidators: true }
            );

            if (!updatedModel) {
                return res.status(404).json({ message: 'AI Model not found.' });
            }
            res.status(200).json({ message: 'AI Model updated successfully', model: updatedModel });
        } catch (error) {
            if (error.code === 11000) { // Duplicate key error
                return res.status(409).json({ message: 'AI Model with this name or modelIdentifier already exists.' }); // Changed from apiName to modelIdentifier
            }
            next(error);
        }
    }

    // Delete an AI Model by ID
    async deleteAIModel(req, res, next) {
        try {
            const { id } = req.params;
            const deletedModel = await AIModel.findByIdAndDelete(id);

            if (!deletedModel) {
                return res.status(404).json({ message: 'AI Model not found.' });
            }
            res.status(200).json({ message: 'AI Model deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AIModelController;
