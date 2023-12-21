const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'name is required'],
        lowercase: true,
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        lowercase: true,
    },
    img: {
        type: String,
        required: [true, 'your image is required'],
    },
    description: {
        type: String,
        required: [true, 'description is required'],
    },
    isPublished: { 
        type: Boolean,
        default: false
    },
},{ timestamps: true });

const Feedback = mongoose.model('feedback', feedbackSchema);

module.exports = Feedback;