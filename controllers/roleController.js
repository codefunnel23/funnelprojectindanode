const Role = require('../models/Role');
const Permission = require('../models/Permission');

// Validation
const Joi = require('joi');

const schema = Joi.object({
    name: Joi.string().required().min(2),
    permissions: Joi.alternatives(
        Joi.string(),
        Joi.array().items(Joi.string())
    )
});

module.exports.getCreateRole = async (req, res) => {
    const permissions = await Permission.find();
    return res.render('roles/create', {permissionss: permissions});
}

module.exports.postCreateRole = async (req, res) => {
    const { error } = schema.validate(req.body);
    if (error) {
      req.flash('error', error.details[0].message);
      return res.redirect('/add-role');
    }
  
    const { name, permissions } = req.body;

    console.log("BZAAAAAAAAAAF" ,permissions);
  
    try {
      const existingRole = await Role.findOne({ name });
  
      if (existingRole) {
        req.flash('error', 'Role with the same name already exists');
        return res.redirect('/add-role');
      }
      // Create the role
      const role = await Role.create({ name });
  
      // If permissions were selected, add them to the role
      if (permissions && permissions.length > 0) {
        // Assuming you have a Permission model
        const selectedPermissions = await Permission.find({ _id: { $in: permissions } });
        role.permissions = selectedPermissions;
        await role.save();
      }
  
      req.flash('success', 'Role created successfully');
      return res.redirect('/roles');
    } catch (error) {
      console.error('Error creating role:', error);
      req.flash('error', 'Error creating role');
      return res.redirect('/add-role');
    }
};

module.exports.postDeleteRole = async (req, res) => {
    const roleId = req.params.id;

    try {
        const role = await Role.findById(roleId);

        if (!role) {
            req.flash('error', 'Role not found');
            return res.redirect(`/roles`);
        }

        // Delete the message from the database
        await Role.findByIdAndDelete(roleId);

        req.flash('success', 'Role deleted successfully');
        res.redirect('/roles');
    } catch (error) {
        console.error('Error deleting role:', error);
        req.flash('error', 'Internal Server Error');
        res.redirect(`/roles`);
    }
};

module.exports.getEditRole = async (req, res) => {
    let id = req.params.id;
  
    try {
      const role = await Role.findById(id);
      
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      const permissions = await Permission.find();

      // Render the edit user form with the user data pre-filled
      return res.render('roles/edit',{ role: role, permissionsList: permissions });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}

module.exports.postEditRole = async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) {
      req.flash('error', error.details[0].message);
      return res.redirect(`/edit-role/${req.params.id}`);
  }

  const roleId = req.params.id;
  const { name, permissions } = req.body;

  try {
      const role = await Role.findById(roleId);

      if (!role) {
          req.flash('error', 'Role not found');
          return res.redirect(`/edit-role/${roleId}`);
      }

      // Remove existing permissions
      role.permissions = [];

      // Add new selected permissions
      if (permissions && permissions.length > 0) {
          role.permissions = permissions;
      }

      // Update other fields if needed
      role.name = name;

      // Save the updated role
      await role.save();

      req.flash('success', 'Role updated successfully');
      res.redirect(`/roles`);
  } catch (error) {
      console.error('Error editing role:', error);
      req.flash('error', 'Internal Server Error');
      res.redirect(`/edit-role/${roleId}`);
  }
};