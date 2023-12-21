const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');

// Validation
const Joi = require('joi');

const schema = Joi.object({
    title: Joi.string().min(6).required(),
    content: Joi.string().min(6).required(),

    image: Joi.any(),
    tag: Joi.string().min(2).required(),
    langblog: Joi.string(),
    isPublished:Joi.string().empty('')
});

function createImageName(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')   // Remove special characters
        .replace(/\s+/g, '-')       // Replace spaces with dashes
        .replace(/--+/g, '-');      // Replace multiple dashes with a single dash
};

const validateImageType = (fileName, allowedExtensions) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return allowedExtensions.includes(extension);
};

const validateImageSize = (imageSize, maxSize) => {
    return imageSize <= maxSize;
};


module.exports.createPost = async (req, res) => {

    // Validate data before save
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ error: error.details[0].message });
    }

    const { title, content, tag } = req.body;

    // Check if the title is already used
    const existingPost = await Post.findOne({ title });

    if (existingPost) {
        return res.status(400).json({ error: 'Title is already in use.' });
    }

    // Check if a file is included in the request
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const image = req.files.img;  // Assuming "image" is the field name for the image file

    // Validate image type
    const allowedImageExtensions = ['jpg', 'jpeg', 'png'];

    const isImgValid = validateImageType(image.name, allowedImageExtensions);
    if (!isImgValid) {
        return res.status(400).send('Only image files (jpg, jpeg, png) are allowed.');
    }

    // Validate image size
    const maxImageSize = 2 * 1024 * 1024; // 2MB

    const isImgSizeValid = validateImageSize(image.size, maxImageSize);
    if (!isImgSizeValid) {
        return res.status(400).send('Maximum image size allowed is 2MB.');
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const imageName = createImageName(title)+'-'+timestamp+path.extname(image.name);

    // For simplicity, let's assume you're saving it to a directory named "uploads" in your project
    const imagePath = `uploads/posts/${imageName}`;
    image.mv(imagePath, async function(err) {

        if (err) {
            return res.status(500).send(err);
        }

        // Image successfully saved, now create the post
        const post = await Post.create({
            title: title,
            content: content,
            img: imagePath,
            tag: tag  // Save the image path to the database
        });

        res.json(post);

    });

}

// Update post based on their id
module.exports.editPost = async (req, res) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ error: error.details[0].message });
    }

    const postId = req.params.id;

    const { title, content, tag, isPublished } = req.body;
    const { img } = req.files;
    
    try {
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Validate image type
        const allowedImageExtensions = ['jpg', 'jpeg', 'png'];

        const isImgValid = validateImageType(img.name, allowedImageExtensions);
        if (!isImgValid) {
            return res.status(400).send('Only image files (jpg, jpeg, png) are allowed.');
        }

        // Validate image size
        const maxImageSize = 2 * 1024 * 1024; // 2MB

        const isImgSizeValid = validateImageSize(img.size, maxImageSize);
        if (!isImgSizeValid) {
            return res.status(400).send('Maximum image size allowed is 2MB.');
        }
        
        // Check if the image is being updated
        if (img && img !== post.img) {
            // Delete the old image
            const oldImagePath = post.img;
            fs.unlinkSync(oldImagePath);
        }


        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const imageName = createImageName(title)+'-'+timestamp+path.extname(img.name);

        // For simplicity, let's assume you're saving it to a directory named "uploads" in your project
        const imagePath = `uploads/posts/${imageName}`;

        img.mv(imagePath, async function(err) {

            if (err) {
                return res.status(500).send(err);
            }
            
            // Update the post details
            post.title = title;
            post.content = content;
            post.img = imagePath;
            post.tag = tag;

            if (isPublished !== undefined) {
                post.isPublished = isPublished;
            }

            await post.save();

            res.json({ message: 'Post updated successfully' });
            
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Delete post based on their id
module.exports.deletePost = async (req, res) => {
    const postId = req.params.id;

    try {
        // Find the post to get the associated image filename
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Your code to delete the image file goes here...
        const imagePath = post.img;
        fs.unlinkSync(imagePath);

        // Delete the post from the database
        await Post.findByIdAndDelete(postId);

        res.json({ message: 'Post and associated image deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all data
module.exports.allPosts = async (req, res) => {

    try {
        const posts = await Post.find({ isPublished: true });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

// Get specified data based on slug
module.exports.singlePost = async (req, res) => {

    try {
        const post = await Post.findOne({ slug: req.params.slug });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}


// ================================= CRUD ========================================


module.exports.getCreatePost = async (req, res) => {
    return res.render('posts/create', req.flash('message'));
}

module.exports.postCreatePost = async (req, res) => {
    const { error } = schema.validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect('/add-post');
    }

    const { title, content, tag, langblog } = req.body;
    const image = req.files.img;  // Assuming "img" is the field name for the image file

    try {
        const allowedImageExtensions = ['jpg', 'jpeg', 'png'];
        const maxImageSize = 2 * 1024 * 1024; // 2MB

        if (!validateImageType(image.name, allowedImageExtensions) || !validateImageSize(image.size, maxImageSize)) {
            req.flash('error', 'Invalid image type or size.');
            return res.redirect('/add-post');
        }

        // Generate a unique image name based on title and timestamp
        const timestamp = Date.now();
        const imageName = createImageName(title) + '-' + timestamp + path.extname(image.name);

        console.log(imageName);

        const imagePath = `uploads/posts/${imageName}`;
        image.mv(imagePath);

        const post = await Post.create({
            title,
            content,
            img: imagePath,
            tag,
            langblog
        });

        req.flash('success', 'Post created successfully');
        return res.redirect('/posts');
    } catch (error) {
        console.error('Error creating post:', error);
        req.flash('error', 'Error creating post');
        return res.redirect('/add-post');
    }
}


module.exports.getEditPost = async (req, res) => {
    let id = req.params.id;
  
    try {
      // Find the user by ID
      const post = await Post.findById(id);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Render the edit user form with the user data pre-filled
      return res.render('posts/edit',{ post: post });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}


module.exports.postEditPost = async (req, res) => {
    console.log(req.body);

    const { error } = schema.validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/edit-post/${req.params.id}`);
    }

    const postId = req.params.id;

    const { title, content, tag, isPublished, langblog } = req.body;
    
    try {
        const post = await Post.findById(postId);

        if (!post) {
            req.flash('error', 'Post not found');
            return res.redirect(`/edit-post/${req.params.id}`);
        }

        let imagePath = post.img;  // Default to the existing image

        // Check if 'img' is present in 'req.files'
        if (req.files && req.files.img) {
            const img = req.files.img;

            // Validate image type
            const allowedImageExtensions = ['jpg', 'jpeg', 'png'];
            const isImgValid = validateImageType(img.name, allowedImageExtensions);

            if (!isImgValid) {
                req.flash('error', 'Only image files (jpg, jpeg, png) are allowed.');
                return res.redirect(`/edit-post/${req.params.id}`);
            }

            // Validate image size
            const maxImageSize = 2 * 1024 * 1024; // 2MB
            const isImgSizeValid = validateImageSize(img.size, maxImageSize);

            if (!isImgSizeValid) {
                req.flash('error', 'Maximum image size allowed is 2MB.');
                return res.redirect(`/edit-post/${req.params.id}`);
            }

            // Check if the image is being updated
            if (img && img !== post.img) {
                // Delete the old image
                const oldImagePath = post.img;
                fs.unlinkSync(oldImagePath);
            }

            // Generate a unique image name
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            const imageName = createImageName(title) + '-' + timestamp + path.extname(img.name);

            // Set the new image path
            imagePath = `uploads/posts/${imageName}`;

            // Move the new image
            img.mv(imagePath, (err) => {
                if (err) {
                    req.flash('error', 'Error updating post');
                    return res.redirect(`/edit-post/${req.params.id}`);
                }
            });
        }

        // Update the post details
        post.title = title;
        post.content = content;
        post.img = imagePath;
        post.tag = tag;
        post.langblog = langblog;

        if (isPublished !== undefined) {
            post.isPublished = true;
        }
        
        if (isPublished == undefined) {
            post.isPublished = false;
        }

        await post.save();

        req.flash('success', 'Post updated successfully');
        res.redirect('/posts');
    } catch (error) {
        req.flash('error', 'Internal Server Error');
        return res.redirect(`/edit-post/${req.params.id}`);
    }
};

module.exports.getViewPost = async (req, res) => {
    let id = req.params.id;
  
    try {
      // Find the user by ID
      const post = await Post.findById(id);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Render the edit user form with the user data pre-filled
      return res.render('posts/view',{ post: post });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}


module.exports.postDeletePost = async (req, res) => {
    const postId = req.params.id;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            req.flash('error', 'Post not found');
            return res.redirect(`/posts`);
        }

        // Delete the image file associated with the post
        if (fs.existsSync(post.img)) {
            fs.unlinkSync(post.img);
        }

        // Delete the post from the database
        await Post.findByIdAndDelete(postId);

        req.flash('success', 'Post and associated image deleted successfully');
        res.redirect('/posts');
    } catch (error) {
        console.error('Error deleting post:', error);
        req.flash('error', 'Internal Server Error');
        res.redirect(`/posts`);
    }
};