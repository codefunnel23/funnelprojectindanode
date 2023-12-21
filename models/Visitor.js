const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({

    ipAddress: {
        type: String,
        required: true,
    },
    userAgent: {
        type: String,
    },
    currentUrl: {
        type: String,
    },
    lastVisit: {
        type: Date,
        default: Date.now,
    },
    country: {
        type: String,
    },
    referrer: {
        type: String,
    },

},{ timestamps: true });

const Visitor = mongoose.model('visitor', visitorSchema);

module.exports = Visitor;