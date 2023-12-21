const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
var slygify = require('slugify');

const postSchema = new mongoose.Schema({

    title: {
        type: String,
        required: [true, 'title is required'],
        unique: true,
        lowercase: true,
    },
    content: {
        type: String,
        required: [true, 'content is required'],
    },
    img: {
        type: String,
        required: [true, 'image is required'],
    },
    tag: {
        type: String,
        required: true,
    },
    langblog: {
      type: String,
    },
    isPublished: { 
        type: Boolean,
        default: false
    },
    slug: {
        type: String,
    },
},{ timestamps: true });

// generate slug from title
postSchema.pre("save", function(next) {
    this.slug = slugify(this.title, {
        replacement: '-',
        lowercase: true,
        strict: true,
    });
    next()
})

const Post = mongoose.model('post', postSchema);

module.exports = Post;