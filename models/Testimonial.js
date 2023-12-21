const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'name is required'],
        lowercase: true,
    },
    companyName: {
        type: String,
        required: [true, 'company name is required'],
    },
    userImg: {
        type: String,
        required: [true, 'your image is required'],
    },
    companyImg: { 
        type: String,
        required: [true, 'company image is required'],
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

const Testimonial = mongoose.model('testimonial', testimonialSchema);

module.exports = Testimonial;