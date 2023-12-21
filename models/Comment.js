const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    img: {
        type: String,
    },
    comment: {
        type: String,
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId, // Assuming "postId" will be the Post's _id
        ref: 'Post' // Reference to the "Post" model
    },
    isPublished:{
        type: Boolean,
        default: false,
    }

}, { timestamps: true });

const Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;