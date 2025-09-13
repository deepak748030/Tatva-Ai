const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../middleware/errorHandler');

// Helper function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

class AuthController {
    async register(req, res, next) {
        // --- DIAGNOSTIC LOGS START ---
        console.log('[AuthController.register] Request received.');
        console.log('[AuthController.register] req.body:', req.body);
        console.log('[AuthController.register] Content-Type:', req.headers['content-type']);
        // --- DIAGNOSTIC LOGS END ---

        try {
            const { email, password, phoneNumber } = req.body;

            // Basic validation
            if (!email || !password || !phoneNumber) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter all required fields: email, password, and phone number.'
                });
            }

            // Check if user already exists by email or phone number
            const existingUserByEmail = await User.findOne({ email });
            if (existingUserByEmail) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists.'
                });
            }

            const existingUserByPhone = await User.findOne({ phoneNumber });
            if (existingUserByPhone) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this phone number already exists.'
                });
            }

            const user = await User.create({
                email,
                password,
                phoneNumber
            });

            // Generate token and send response
            res.status(201).json({
                success: true,
                message: 'User registered successfully.',
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    email: user.email,
                    phoneNumber: user.phoneNumber
                }
            });

        } catch (error) {
            // Pass error to the error handling middleware
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Basic validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter both email and password.'
                });
            }

            // Find user by email and select password
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials.'
                });
            }

            // Check if password matches
            const isMatch = await user.matchPassword(password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials.'
                });
            }

            // Generate token and send response
            res.status(200).json({
                success: true,
                message: 'Logged in successfully.',
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    email: user.email,
                    phoneNumber: user.phoneNumber
                }
            });

        } catch (error) {
            // Pass error to the error handling middleware
            next(error);
        }
    }
}

module.exports = AuthController;
