const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const lastRequestDay = new Date(req.user.lastRequestDate);
            lastRequestDay.setHours(0, 0, 0, 0);

            if (lastRequestDay.getTime() < today.getTime()) {
                console.log(`[AuthMiddleware] Resetting daily requests for user ${req.user.id}`);

                // Check if subscription has expired
                if (req.user.subscriptionPlan !== 'none' && req.user.subscriptionEndDate && req.user.subscriptionEndDate < Date.now()) {
                    console.log(`[AuthMiddleware] Subscription for user ${req.user.id} has expired. Downgrading plan.`);
                    req.user.subscriptionPlan = 'none';
                    req.user.bonusRequests = 0;
                    req.user.hasActiveSubscription = false;
                    req.user.subscriptionEndDate = null;
                }

                // Reset daily requests remaining based on current plan
                req.user.dailyRequestsRemaining = req.user.baseDailyRequests + req.user.bonusRequests;
                req.user.lastRequestDate = Date.now();
                await req.user.save();
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };

