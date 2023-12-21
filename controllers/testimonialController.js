const Testimonial = require('../models/Testimonial');
const fs = require('fs');
// Validation
const Joi = require('joi');

const schema = Joi.object({
    name: Joi.string().min(2).required(),
    companyName: Joi.string().min(2).required(),
    userImg: Joi.any(),
    companyImg: Joi.any(),
    description: Joi.string().min(6).required(),
    isPublished:Joi.string().empty('')
})

module.exports.createTestimonial = async (req, res) => {

    // Validate data before save
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ error: error.details[0].message });
    }

    const { name, companyName, description } = req.body;
    const { userImg, companyImg } = req.files;

    // Check if a file is included in the request
    if (!userImg || !companyImg) {
        return res.status(400).send('No files were uploaded.');
    }

    // Validate image type
    const userImgExt = userImg.name.split('.').pop().toLowerCase();
    const companyImgExt = companyImg.name.split('.').pop().toLowerCase();
    const allowedImageExtensions = ['jpg', 'jpeg', 'png'];
    if (!allowedImageExtensions.includes(userImgExt) || !allowedImageExtensions.includes(companyImgExt)) {
        return res.status(400).send('Only image files (jpg, jpeg, png) are allowed.');
    }

    // Validate image size (max 2MB)
    const maxImageSize = 2 * 1024 * 1024; // 2MB
    const userImgSize = userImg.size;
    const companyImgSize = companyImg.size;
    if (userImgSize > maxImageSize || companyImgSize > maxImageSize) {
        return res.status(400).send('Maximum image size allowed is 2MB.');
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const userImageName = `${timestamp}-${userImg.name.replace(/ /g, '-')}`;
    const companyImageName = `${timestamp}-${companyImg.name.replace(/ /g, '-')}`;

    // Specify the paths where you want to save the images
    const userImagePath = `uploads/testimonials/${userImageName}`;
    const companyImagePath = `uploads/testimonials/${companyImageName}`;

    // Check if the "uploads/testimonials" folder exists, if not, create it
    if (!fs.existsSync('uploads/testimonials')) {
        fs.mkdirSync('uploads/testimonials', { recursive: true });
    }

    // Move the uploaded images to the specified paths
    userImg.mv(userImagePath, async function(err) {
        if (err) {
            return res.status(500).send(err);
        }

        companyImg.mv(companyImagePath, async function(err) {
            if (err) {
                // If there's an error moving the second image, delete the first image and return an error response
                fs.unlinkSync(userImagePath);
                return res.status(500).send(err);
            }

            try {
                // Create the testimonial with the image filenames
                const testimonial = await Testimonial.create({
                    name,
                    companyName,
                    userImg: userImagePath,
                    companyImg: companyImagePath,
                    description
                });

                res.json(testimonial);

            } catch (error) {
                // If there's an error creating the testimonial, delete both images and return an error response
                fs.unlinkSync(userImagePath);
                fs.unlinkSync(companyImagePath);
                return res.status(500).send('Error creating testimonial');
            }
        });
    });

}

//=============================================================================================================

// Update testimonial based on their id
module.exports.editTestimonial = async (req, res) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ error: error.details[0].message });
    }

    const testimonialId = req.params.id;
    const { name, companyName, description, isPublished } = req.body;
    const { userImg = null, companyImg = null } = req.files || {};

    // Validate image type and size if userImg exists
    if (userImg) {
        const allowedImageExtensions = ['jpg', 'jpeg', 'png'];
        const isUserImgValid = validateImageType(userImg.name, allowedImageExtensions);
        const isUserImgSizeValid = validateImageSize(userImg.size, 2 * 1024 * 1024); // 2MB
        if (!isUserImgValid || !isUserImgSizeValid) {
            return res.status(400).send('User image: Only images (jpg, jpeg, png) are allowed, and maximum size allowed is 2MB.');
        }
    }

    // Validate image type and size if companyImg exists
    if (companyImg) {
        const allowedImageExtensions = ['jpg', 'jpeg', 'png'];
        const isCompanyImgValid = validateImageType(companyImg.name, allowedImageExtensions);
        const isCompanyImgSizeValid = validateImageSize(companyImg.size, 2 * 1024 * 1024); // 2MB
        if (!isCompanyImgValid || !isCompanyImgSizeValid) {
            return res.status(400).send('Company image: Only images (jpg, jpeg, png) are allowed, and maximum size allowed is 2MB.');
        }
    }
    
    try {
        const testimonial = await Testimonial.findById(testimonialId);
        
        if (!testimonial) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }
        
        // Check if the user image is being updated
        if (userImg && userImg !== testimonial.userImg) {
            // Delete the old user image
            const userOldImagePath = testimonial.userImg;
            if (fs.existsSync(userOldImagePath)) {
                fs.unlinkSync(userOldImagePath);
            }

            const timestamp = new Date().toISOString().replace(/:/g, '-');
            const userImageName = `${timestamp}-${userImg.name.replace(/ /g, '-')}`;
            const userImagePath = `uploads/testimonials/${userImageName}`;

            //Uploading the user image to directory
            await userImg.mv(userImagePath);
            testimonial.userImg = userImagePath;
        }


        // Check if the company image is being updated
        if (companyImg && companyImg !== testimonial.companyImg) {
            // Delete the old user image
            const companyOldImagePath = testimonial.companyImg;
            if (fs.existsSync(companyOldImagePath)) {
                fs.unlinkSync(companyOldImagePath);
            }
            
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            const companyImageName = `${timestamp}-${companyImg.name.replace(/ /g, '-')}`;
            const companyImagePath = `uploads/testimonials/${companyImageName}`;

            //Uploading the user image to directory
            await companyImg.mv(companyImagePath);
            testimonial.companyImg = companyImagePath;
        }

        // Update the testimonial details
        testimonial.name = name;
        testimonial.companyName = companyName;
        // testimonial.user_img = userImagePath;
        // testimonial.company_img = companyImagePath;
        testimonial.description = description;

        // Update isPublished
        if (isPublished !== undefined) {
            testimonial.isPublished = isPublished;
        }

        await testimonial.save();

        res.json({ message: 'Testimonial updated successfully' });

    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


//=====================================================================================================================

// Delete testimonial based on their id
module.exports.deleteTestimonial = async (req, res) => {
    const testimonialId = req.params.id;

    try {
        // Find the testimonial to get the associated image filename
        const testimonial = await Testimonial.findById(testimonialId);

        if (!testimonial) {
            return res.status(404).json({ error: 'Testimonial not found' });
        }

        // Your code to delete the images goes here...
        const userImgPath = testimonial.userImg;
        const companyImgPath = testimonial.companyImg;

        if(fs.existsSync(userImgPath)){
            fs.unlinkSync(userImgPath);
        }

        if(fs.existsSync(companyImgPath)){
            fs.unlinkSync(companyImgPath);
        }

        // Delete testimonial from the database
        await Testimonial.findByIdAndDelete(testimonialId);

        res.json({ message: 'Testimonial and associated images deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports.allTestimonials = async (req, res) => {

try {
        const testimonials = await Testimonial.find({ isPublished: true });
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

// ===================================================================================
// ===================================================================================

module.exports.getCreateTestimonial = async (req, res) => {
    return res.render('testimonials/create', req.flash('message'));
}

module.exports.postCreateTestimonial = async (req, res) => {
    // Validate data before save
    const { error } = schema.validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect('/add-testimonial');  // Redirect to appropriate page
    }

    const { name, companyName, description } = req.body;
    const { userImg, companyImg } = req.files;

    // Check if a file is included in the request
    if (!userImg || !companyImg) {
        req.flash('error', 'Images are required.');
        return res.redirect('/add-testimonial');  // Redirect to appropriate page
    }

    // Validate image type
    const userImgExt = userImg.name.split('.').pop().toLowerCase();
    const companyImgExt = companyImg.name.split('.').pop().toLowerCase();
    const allowedImageExtensions = ['jpg', 'jpeg', 'png'];
    if (!allowedImageExtensions.includes(userImgExt) || !allowedImageExtensions.includes(companyImgExt)) {
        req.flash('error', 'Only image files (jpg, jpeg, png) are allowed.');
        return res.redirect('/add-testimonial');  // Redirect to appropriate page
    }

    // Validate image size (max 2MB)
    const maxImageSize = 2 * 1024 * 1024; // 2MB
    const userImgSize = userImg.size;
    const companyImgSize = companyImg.size;
    if (userImgSize > maxImageSize || companyImgSize > maxImageSize) {
        req.flash('error', 'Maximum image size allowed is 2MB.');
        return res.redirect('/add-testimonial');  // Redirect to appropriate page
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const userImageName = `${timestamp}-${userImg.name.replace(/ /g, '-')}`;
    const companyImageName = `${timestamp}-${companyImg.name.replace(/ /g, '-')}`;

    // Specify the paths where you want to save the images
    const userImagePath = `uploads/testimonials/${userImageName}`;
    const companyImagePath = `uploads/testimonials/${companyImageName}`;

    // Check if the "uploads/testimonials" folder exists, if not, create it
    if (!fs.existsSync('uploads/testimonials')) {
        fs.mkdirSync('uploads/testimonials', { recursive: true });
    }

    // Move the uploaded images to the specified paths
    userImg.mv(userImagePath, async function(err) {
        if (err) {
            req.flash('error', 'Error uploading user image.');
            return res.redirect('/add-testimonial');  // Redirect to appropriate page
        }

        companyImg.mv(companyImagePath, async function(err) {
            if (err) {
                // If there's an error moving the second image, delete the first image and return an error response
                fs.unlinkSync(userImagePath);
                req.flash('error', 'Error uploading company image.');
                return res.redirect('/add-testimonial');  // Redirect to appropriate page
            }

            try {
                // Create the testimonial with the image filenames
                const testimonial = await Testimonial.create({
                    name,
                    companyName,
                    userImg: userImagePath,
                    companyImg: companyImagePath,
                    description
                });

                req.flash('success', 'Testimonial created successfully.');
                res.redirect('/add-testimonial');  // Redirect to appropriate page
            } catch (error) {
                // If there's an error creating the testimonial, delete both images and return an error response
                fs.unlinkSync(userImagePath);
                fs.unlinkSync(companyImagePath);
                req.flash('error', 'Error creating testimonial.');
                return res.redirect('/add-testimonial');  // Redirect to appropriate page
            }
        });
    });
}


module.exports.getEditTestimonial = async (req, res) => {
    let id = req.params.id;
  
    try {
      // Find the user by ID
      const testimonial = await Testimonial.findById(id);
  
      if (!testimonial) {
        return res.status(404).json({ message: 'Testimonial not found' });
      }
  
      // Render the edit user form with the user data pre-filled
      return res.render('testimonials/edit',{ testimonial: testimonial });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}


module.exports.postEditTestimonial = async (req, res) => {
    console.log(req.body);
    const { error } = schema.validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect(`/edit-testimonial/${req.params.id}`);
    }

    const testimonialId = req.params.id;
    const { name, companyName, description, isPublished } = req.body;

    try {
        const testimonial = await Testimonial.findById(testimonialId);

        if (!testimonial) {
            req.flash('error', 'Testimonial not found');
            return res.redirect(`/edit-testimonial/${testimonialId}`);
        }

        // Check if images are provided
        let userImagePath, companyImagePath;
        if (req.files) {
            const { userImg, companyImg } = req.files;

            // Check if the user image is being updated
            if (userImg && userImg !== testimonial.userImg) {
                // Delete the old user image
                const userOldImagePath = testimonial.userImg;
                if (fs.existsSync(userOldImagePath)) {
                    fs.unlinkSync(userOldImagePath);
                }

                const timestamp = new Date().toISOString().replace(/:/g, '-');
                const userImageName = `${timestamp}-${userImg.name.replace(/ /g, '-')}`;
                userImagePath = `uploads/testimonials/${userImageName}`;

                // Uploading the user image to directory
                await userImg.mv(userImagePath);

                testimonial.userImg = userImagePath;
            }

            // Check if the company image is being updated
            if (companyImg && companyImg !== testimonial.companyImg) {
                // Delete the old company image
                const companyOldImagePath = testimonial.companyImg;
                if (fs.existsSync(companyOldImagePath)) {
                    fs.unlinkSync(companyOldImagePath);
                }

                const companyImageName = `${new Date().toISOString().replace(/:/g, '-')}-company${companyImg.name}`;
                companyImagePath = `uploads/testimonials/${companyImageName}`;

                // Uploading the company image to directory
                await companyImg.mv(companyImagePath);

                testimonial.companyImg = companyImagePath;
            }
        }

        // Update the testimonial details
        testimonial.name = name;
        testimonial.companyName = companyName;
        testimonial.description = description;

        if (isPublished !== undefined) {
            testimonial.isPublished = true;
        } else {
            testimonial.isPublished = false;
        }

        await testimonial.save();

        req.flash('success', 'Testimonial updated successfully');
        res.redirect(`/edit-testimonial/${testimonialId}`);

    } catch (error) {
        req.flash('error', 'Internal Server Error');
        res.redirect(`/edit-testimonial/${testimonialId}`);
    }

}


module.exports.postDeleteTestimonial = async (req, res) => {
    const testimonialId = req.params.id;

    try {
        const testimonial = await Testimonial.findById(testimonialId);

        if (!testimonial) {
            req.flash('error', 'Testimonial not found');
            return res.redirect(`/testimonials`);
        }

        // Delete the image files associated with the testimonial
        if (fs.existsSync(testimonial.userImg)) {
            fs.unlinkSync(testimonial.userImg);
        }

        if (fs.existsSync(testimonial.companyImg)) {
            fs.unlinkSync(testimonial.companyImg);
        }

        // Delete the testimonial from the database
        await Testimonial.findByIdAndDelete(testimonialId);

        req.flash('success', 'Testimonial and associated images deleted successfully');
        res.redirect('/testimonials');
    } catch (error) {
        console.error('Error deleting testimonial:', error);
        req.flash('error', 'Internal Server Error');
        res.redirect(`/testimonials`);
    }
};

module.exports.getViewTestimonial = async (req, res) => {
    let id = req.params.id;
  
    try {

      const testimonial = await Testimonial.findById(id);
  
      if (!testimonial) {
        return res.status(404).json({ message: 'Testimonial not found' });
      }
  
      return res.render('testimonials/view',{ testimonial: testimonial });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}

