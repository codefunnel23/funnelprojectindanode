const Permission = require('../models/Permission');

// Validation
const Joi = require('joi');

const schema = Joi.object({
    name: Joi.string().required().min(2),
});

module.exports.getCreatePermission = async (req, res) => {
    return res.render('permissions/create', req.flash('message'));
}

module.exports.postCreatePermission = async (req, res) => {
    const { error } = schema.validate(req.body);
    if (error) {
      req.flash('error', error.details[0].message);
      return res.redirect('/add-permission');
    }
  
    const { name } = req.body;
  
    try {
      // Check if permission already exists in db
      const existingPermission = await Permission.findOne({ name });
  
      if (existingPermission) {
        req.flash('error', 'Permission with the same name already exists');
        return res.redirect('/add-permission');
      }
  
      // If permission doesn't exist, create it
      const permission = await Permission.create({
        name,
      });
  
      req.flash('success', 'Permission created successfully');
      return res.redirect('/permissions');
    } catch (error) {
      console.error('Error creating permission:', error);
      req.flash('error', 'Error creating permission');
      return res.redirect('/add-permission');
    }
};

module.exports.getEditPermission = async (req, res) => {
  let id = req.params.id;
  
    try {
      const permission = await Permission.findById(id);
      
      if (!permission) {
        return res.status(404).json({ message: 'Permission not found' });
      }

      // Render the edit user form with the user data pre-filled
      return res.render('permissions/edit',{ selectedPermission: permission });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}

module.exports.postEditPermission = async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) {
      req.flash('error', error.details[0].message);
      return res.redirect(`/edit-permission/${req.params.id}`);
  }

  const permissionId = req.params.id;
  const { name } = req.body;

  try {
      // Check if permission already exists in db
      const existingPermission = await Permission.findById(permissionId);

      if (!existingPermission) {
          req.flash('error', 'Permission not found');
          return res.redirect(`/edit-permission/${permissionId}`);
      }

      // Update the permission details
      existingPermission.name = name;

      // Save the updated permission
      await existingPermission.save();

      req.flash('success', 'Permission updated successfully');
      return res.redirect('/permissions');
  } catch (error) {
      console.error('Error editing permission:', error);
      req.flash('error', 'Error editing permission');
      return res.redirect(`/edit-permission/${permissionId}`);
  }
};

module.exports.postDeletePermission = async (req, res) => {
    const permissionId = req.params.id;

    try {
        const permission = await Permission.findById(permissionId);

        if (!permission) {
            req.flash('error', 'Permission not found');
            return res.redirect(`/permissions`);
        }

        // Delete the message from the database
        await Permission.findByIdAndDelete(permissionId);

        req.flash('success', 'Permission deleted successfully');
        res.redirect('/permissions');
    } catch (error) {
        console.error('Error deleting permission:', error);
        req.flash('error', 'Internal Server Error');
        res.redirect(`/permissions`);
    }
};