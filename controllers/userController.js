const User = require('../models/User');
const { errorHandler } = require('../middleware/errorHandler');

// Define available subscription plans
const SUBSCRIPTION_PLANS = [
    {
        planType: 'basic',
        name: 'Basic Plan',
        price: 199, // Example price in Rs
        bonusRequests: 50,
        durationMonths: 1,
        description: 'Get 50 extra requests per day for one month.'
    },
    {
        planType: 'premium',
        name: 'Premium Plan',
        price: 399, // Example price in Rs
        bonusRequests: 100,
        durationMonths: 1,
        description: 'Get 100 extra requests per day for one month.'
    },
    {
        planType: 'unlimited',
        name: 'Unlimited Plan',
        price: 599, // Example price in Rs
        bonusRequests: 0, // Not applicable, handled by hasActiveSubscription
        durationMonths: null, // Unlimited duration
        description: 'Enjoy unlimited requests with no daily limits.'
    },
    {
        planType: 'none',
        name: 'Free Tier',
        price: 0,
        bonusRequests: 0,
        durationMonths: null,
        description: 'Default free access with 5 daily requests.'
    }
];

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
            const { email, phoneNumber, password, hasActiveSubscription, subscriptionPlan, subscriptionEndDate, bonusRequests } = req.body;
            const userId = req.params.id;

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            // Update fields if provided
            if (email) user.email = email;
            if (phoneNumber) user.phoneNumber = phoneNumber;
            if (password) user.password = password; // Password will be hashed by pre-save hook
            if (typeof hasActiveSubscription === 'boolean') user.hasActiveSubscription = hasActiveSubscription;
            if (subscriptionPlan) user.subscriptionPlan = subscriptionPlan;
            if (subscriptionEndDate) user.subscriptionEndDate = subscriptionEndDate;
            if (typeof bonusRequests === 'number') user.bonusRequests = bonusRequests;

            // Recalculate dailyRequestsRemaining if subscription related fields are updated
            if (subscriptionPlan || typeof bonusRequests === 'number') {
                user.dailyRequestsRemaining = user.baseDailyRequests + user.bonusRequests;
            }

            await user.save(); // Use save() to trigger pre-save hooks (like password hashing and updatedAt)

            res.status(200).json({
                success: true,
                message: 'User updated successfully.',
                data: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    phoneNumber: user.phoneNumber,
                    baseDailyRequests: user.baseDailyRequests,
                    bonusRequests: user.bonusRequests,
                    dailyRequestsRemaining: user.dailyRequestsRemaining,
                    lastRequestDate: user.lastRequestDate,
                    hasActiveSubscription: user.hasActiveSubscription,
                    subscriptionPlan: user.subscriptionPlan,
                    subscriptionEndDate: user.subscriptionEndDate,
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

    // Get authenticated user's usage information
    async getTokenBalance(req, res, next) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Not authorized, user not found.' });
            }

            res.status(200).json({
                success: true,
                userId: req.user._id,
                username: req.user.username,
                baseDailyRequests: req.user.baseDailyRequests,
                bonusRequests: req.user.bonusRequests,
                dailyRequestsRemaining: req.user.dailyRequestsRemaining,
                lastRequestDate: req.user.lastRequestDate,
                hasActiveSubscription: req.user.hasActiveSubscription,
                subscriptionPlan: req.user.subscriptionPlan,
                subscriptionEndDate: req.user.subscriptionEndDate
            });
        } catch (error) {
            next(error);
        }
    }

    // NEW: Method to get all available subscription plans
    async getSubscriptionPlans(req, res, next) {
        try {
            // Filter out sensitive info if any, though none currently exists in SUBSCRIPTION_PLANS
            const plans = SUBSCRIPTION_PLANS.map(plan => ({
                planType: plan.planType,
                name: plan.name,
                price: plan.price,
                bonusRequests: plan.bonusRequests,
                durationMonths: plan.durationMonths,
                description: plan.description
            }));
            res.status(200).json({
                success: true,
                plans: plans
            });
        } catch (error) {
            next(error);
        }
    }

    // NEW: Method to subscribe a user to a plan
    async subscribeUser(req, res, next) {
        try {
            const { planType } = req.body;
            const userId = req.params.id; // Assuming admin or user themselves can subscribe

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            const selectedPlan = SUBSCRIPTION_PLANS.find(plan => plan.planType === planType);

            if (!selectedPlan) {
                return res.status(400).json({ success: false, message: 'Invalid plan type provided.' });
            }

            let message = '';
            const oneMonthInMs = 30 * 24 * 60 * 60 * 1000; // Approximately 30 days

            user.subscriptionPlan = selectedPlan.planType;
            user.bonusRequests = selectedPlan.bonusRequests;
            user.hasActiveSubscription = (selectedPlan.planType !== 'none');

            if (selectedPlan.durationMonths) {
                user.subscriptionEndDate = new Date(Date.now() + (selectedPlan.durationMonths * oneMonthInMs));
            } else {
                user.subscriptionEndDate = null; // Unlimited or free tier
            }

            message = `${selectedPlan.name} activated successfully! ${selectedPlan.description}`;
            if (selectedPlan.planType === 'none') {
                message = 'Subscription cancelled. You are now on the free tier.';
            }

            // Reset daily requests remaining based on the new plan
            user.dailyRequestsRemaining = user.baseDailyRequests + user.bonusRequests;
            user.lastRequestDate = Date.now(); // Update last request date to ensure immediate reset

            await user.save();

            res.status(200).json({
                success: true,
                message: message,
                data: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    baseDailyRequests: user.baseDailyRequests,
                    bonusRequests: user.bonusRequests,
                    dailyRequestsRemaining: user.dailyRequestsRemaining,
                    hasActiveSubscription: user.hasActiveSubscription,
                    subscriptionPlan: user.subscriptionPlan,
                    subscriptionEndDate: user.subscriptionEndDate
                }
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;

