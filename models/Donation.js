const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({

    donorName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['PayPal', 'Stripe'],
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },

}, { timestamps: true });

const Donation = mongoose.model('donation', donationSchema);

module.exports = Donation;