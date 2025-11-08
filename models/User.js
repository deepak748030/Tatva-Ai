const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please fill a valid email address']
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    baseDailyRequests: { // NEW: Base free requests
        type: Number,
        default: 5
    },
    bonusRequests: { // NEW: Requests from subscription
        type: Number,
        default: 0
    },
    dailyRequestsRemaining: { // MODIFIED: Renamed from dailyFreeRequests
        type: Number,
        default: 5 // Default starting free requests for new users
    },
    lastRequestDate: {
        type: Date,
        default: Date.now
    },
    hasActiveSubscription: {
        type: Boolean,
        default: false
    },
    subscriptionPlan: { // NEW: Stores the active subscription plan
        type: String,
        enum: ['none', 'basic', 'premium', 'unlimited'],
        default: 'none'
    },
    subscriptionEndDate: { // NEW: Date when subscription expires
        type: Date,
        default: null
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

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    this.updatedAt = Date.now();
    next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

