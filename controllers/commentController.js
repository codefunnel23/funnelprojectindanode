const Comment = require('../models/Comment');

// Validation
const Joi = require('joi');

const schema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().required().email(),
    img: Joi.string(),
    comment: Joi.string().min(2).required(),
    postId: Joi.string(),
    isPublished:Joi.string().empty('')
});

module.exports.createComment = async (req, res) => {
    // Validate data before save
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ error: error.details[0].message });
    }

    // Create a new comment object with the validated data
    const comment = new Comment({
        name: req.body.name,
        email: req.body.email,
        img: req.body.img,
        comment: req.body.comment,
        postId: req.body.postId
    });

    try {
        // Save the comment to the database
        const savedComment = await comment.save();
        res.status(201).json(savedComment);
    } catch (err) {
        res.status(500).json({ error: 'Could not save the comment.' });
    }
}

// Get all data
// module.exports.allComments = async (req, res) => {
//     try {
//         const comments = await Comment.find();
//         res.json(comments);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }

// }


// Get all data
module.exports.allComments = async (req, res) => {

    const postId = req.query.postId; // Get post ID from the query string

try {
      // Fetch comments from DB that match the post ID
      const filteredComments = await Comment.find({ postId, isPublished: true });
      res.json(filteredComments);
    } catch (error) {
      res.status(500).json({ error: 'Unable to fetch comments'});
    }

}

// ========================= CRUD ===============================
// ========================= CRUD ===============================

module.exports.postDeleteComment = async (req, res) => {
    const commentId = req.params.id;

    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            req.flash('error', 'Comment not found');
            return res.redirect(`/comments`);
        }

        // Delete the message from the database
        await Comment.findByIdAndDelete(commentId);

        req.flash('success', 'Comment deleted successfully');
        res.redirect('/comments');
    } catch (error) {
        console.error('Error deleting comment:', error);
        req.flash('error', 'Internal Server Error');
        res.redirect(`/comments`);
    }
};

module.exports.getEditComment = async (req, res) => {
    let id = req.params.id;
  
    try {
      // Find the user by ID
      const comment = await Comment.findById(id);
  
      if (!comment) {
        return res.status(404).json({ message: 'comment not found' });
      }
  
      // Render the edit
      return res.render('comments/edit',{ comment: comment });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}

module.exports.postEditComment = async (req, res) => {

    const commentId = req.params.id;
    const { isPublished } = req.body;
    
    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            req.flash('error', 'Comment not found');
            return res.redirect(`/edit-comment/${req.params.id}`);
        }

        if (isPublished !== undefined) {
            comment.isPublished = true;
        }
        
        if (isPublished == undefined) {
            comment.isPublished = false;
        }

        await comment.save();

        req.flash('success', 'Comment updated successfully');
        res.redirect('/comments');
    } catch (error) {
        req.flash('error', 'Internal Server Error');
        return res.redirect(`/edit-comment/${req.params.id}`);
    }

}

module.exports.getViewComment = async (req, res) => {
    let id = req.params.id;
  
    try {
      // Find the user by ID
      const comment = await Comment.findById(id);
  
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      // Render the edit user form with the user data pre-filled
      return res.render('comments/view',{ comment: comment });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}