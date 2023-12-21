const Feedback = require('../models/Feedback');
const fs = require('fs');
// Validation
const Joi = require('joi');

const schema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    img: Joi.any(),
    description: Joi.string().min(6).required(),
    isPublished:Joi.string().empty('')
})

module.exports.createFeedback = async (req, res) => {

    // Validate data before save
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ error: error.details[0].message });
    }

    const { name, email, description } = req.body;
    const { img } = req.files;

    // Check if a file is included in the request
    if (!img) {
        return res.status(400).send('No image were uploaded.');
    }

    // Validate image type
    const imgExt = img.name.split('.').pop().toLowerCase();
    const allowedImageExtensions = ['jpg', 'jpeg', 'png'];
    if (!allowedImageExtensions.includes(imgExt)) {
        return res.status(400).send('Only images (jpg, jpeg, png) are allowed.');
    }

    // Validate image size (max 2MB)
    const maxImageSize = 2 * 1024 * 1024; // 2MB
    const imgSize = img.size;
    if (imgSize > maxImageSize) {
        return res.status(400).send('Maximum image size allowed is 2MB.');
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const imgName = `${timestamp}-${img.name.replace(/ /g, '-')}`;

    // Specify the paths where you want to save the images
    const imagePath = `uploads/feedbacks/${imgName}`;

    // Check if the "uploads/testimonials" folder exists, if not, create it
    if (!fs.existsSync('uploads/feedbacks')) {
        fs.mkdirSync('uploads/feedbacks', { recursive: true });
    }

    // Move the uploaded images to the specified paths
    img.mv(imagePath, async function(err) {
        if (err) {
            return res.status(500).send(err);
        }

        try {
            // Create the testimonial with the image filenames
            const feedback = await Feedback.create({
                name,
                email,
                img: imagePath,
                description
            });

            res.json(feedback);

        } catch (error) {
            // If there's an error creating the testimonial, delete both images and return an error response
            fs.unlinkSync(imagePath);
            return res.status(500).send('Error creating testimonial');
        }
    });

}

// ========================= DASHBOARD ==============================
// ========================= DASHBOARD ==============================

module.exports.postDeleteFeedback = async (req, res) => {
    const feedbackId = req.params.id;

    try {
        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
            req.flash('error', 'Feedback not found');
            return res.redirect(`/feedbacks`);
        }

        // Delete the image files associated with the feedback
        if (fs.existsSync(feedback.img)) {
            fs.unlinkSync(feedback.img);
        }

        // Delete the feedback from the database
        await Feedback.findByIdAndDelete(feedbackId);

        req.flash('success', 'Feedback and associated image deleted successfully');
        res.redirect('/feedbacks');
    } catch (error) {
        console.error('Error deleting feedback:', error);
        req.flash('error', 'Internal Server Error');
        res.redirect(`/feedbacks`);
    }
};

module.exports.getViewFeedback = async (req, res) => {
    let id = req.params.id;
  
    try {

      const feedback = await Feedback.findById(id);
  
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }
  
      return res.render('feedbacks/view',{ feedback: feedback });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}

module.exports.getEditFeedback = async (req, res) => {
    let id = req.params.id;
  
    try {
      // Find the user by ID
      const feedback = await Feedback.findById(id);
  
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }
  
      // Render the edit
      return res.render('feedbacks/edit',{ feedback: feedback });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}

module.exports.postEditFeedback = async (req, res) => {

    const feedbackId = req.params.id;
    const { isPublished } = req.body;
    
    try {
        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
            req.flash('error', 'Feedback not found');
            return res.redirect(`/edit-feedback/${req.params.id}`);
        }

        if (isPublished !== undefined) {
            feedback.isPublished = true;
        }
        
        if (isPublished == undefined) {
            feedback.isPublished = false;
        }

        await feedback.save();

        req.flash('success', 'Feedback updated successfully');
        res.redirect('/feedbacks');
    } catch (error) {
        req.flash('error', 'Internal Server Error');
        return res.redirect(`/edit-feedback/${req.params.id}`);
    }

}
