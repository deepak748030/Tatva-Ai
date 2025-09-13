const User = require('../models/User');
const { errorHandler } = require('../middleware/errorHandler');

class UserController {
    // Get all users (Admin only, or protected)
    async getAllUsers(req, res, next) {
        try {
            // Exclude password from results
            const users = await User.find({}).select('-password');
            res.status(200).json({
                success: true,
                count: users.length,
                data: users
            });
        } catch (error) {
            next(error);
        }
    }

    // Get a single user by ID
    async getUserById(req, res, next) {
        try {
            const user = await User.findById(req.params.id).select('-password');
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    // Update a user by ID
    async updateUser(req, res, next) {
        try {
            const { email, phoneNumber, password } = req.body;
            const userId = req.params.id;

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            // Update fields if provided
            if (email) user.email = email;
            if (phoneNumber) user.phoneNumber = phoneNumber;
            if (password) user.password = password; // Password will be hashed by pre-save hook

            await user.save(); // Use save() to trigger pre-save hooks (like password hashing and updatedAt)

            res.status(200).json({
                success: true,
                message: 'User updated successfully.',
                data: {
                    id: user._id,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            });
        } catch (error) {
            if (error.code === 11000) { // Duplicate key error
                return res.status(409).json({ message: 'Email or phone number already in use.' });
            }
            next(error);
        }
    }

    // Delete a user by ID
    async deleteUser(req, res, next) {
        try {
            const deletedUser = await User.findByIdAndDelete(req.params.id);

            if (!deletedUser) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            res.status(200).json({ success: true, message: 'User deleted successfully.' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;
