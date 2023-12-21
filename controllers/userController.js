const Role = require('../models/Role');
const User = require('../models/User');
const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string(),
});

// Create schema for the create method
const createSchema = schema.keys({
  password: Joi.string().min(6).required(),
});

// Create schema for the edit method
const editSchema = schema.keys({
  password: Joi.string().min(6).allow(''),  // Allow an empty string for edit
});

module.exports.getCreateUser = async (req, res, next) => {
  // getting the data and sed it with 
   const roles = await Role.find();
   return res.render('users/create', {roles: roles});
}

module.exports.postCreateUser = async (req, res, next) => {
  const { error } = createSchema.validate(req.body);

  if (error) {
    req.flash('error', error.details[0].message);
    return res.redirect('/add-user');
  }

  console.log(req.body);

  const { name, email, password, role } = req.body;

  try {
    // Find the role by ID
    const existingRole = await Role.findById(role);

    // Check if the role exists
    if (!existingRole) {
      req.flash('error', 'Role not found');
      return res.redirect('/add-user');
    }

    // Create the user and assign the role directly
    const user = await User.create({
      name,
      email,
      password,
      roles: [existingRole._id], // Assign the role to the user
    });

    req.flash('success', 'User created successfully');
    return res.redirect('/add-user');
  } catch (err) {
    console.error('Error creating user:', err);
    req.flash('error', 'Internal Server Error');
    return res.redirect('/add-user');
  }
};

// Edit User


module.exports.getEditUser = async (req, res, next) => {
    let id = req.params.id;
  
    try {
      // Find the user by ID
      const user = await User.findById(id);

      const roles = await Role.find();
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Render the edit user form with the user data pre-filled
      return res.render('users/edit',{ record: user, roles: roles });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};

module.exports.postEditUser = async (req, res, next) => {
  console.log(req.body);

  const { error } = editSchema.validate(req.body);
  if (error) {
    req.flash('error', error.details[0].message);
    return res.redirect(`/edit-user/${req.params.id}`);
  }

  const id = req.params.id;
  const { name, email, password, role } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect(`/edit-user/${req.params.id}`);
    }

    // Find the role by ID
    const newRole = await Role.findById(role);

    // Check if the role exists
    if (!newRole) {
      req.flash('error', 'Role not found');
      return res.redirect(`/edit-user/${req.params.id}`);
    }

    // Remove the old roles from the user
    user.roles = [];

    // Add the new role to the user
    user.roles.push(newRole._id);

    // Update the user's information
    user.name = name || user.name;
    user.email = email || user.email;

    // Update the password only if a new password is provided
    user.password = (password !== null && password.trim() !== '') ? password : user.password;

    // Save the updated user to the database
    await user.save();

    req.flash('success', 'User updated successfully');
    res.redirect(`/edit-user/${req.params.id}`);
  } catch (error) {
    req.flash('error', error.message);
    res.redirect(`/edit-user/${req.params.id}`);
  }
};

module.exports.deleteUser = async (req, res, next) => {
    const id = req.params.id;
  
    try {
  
      // Delete the user
      await User.findByIdAndDelete(id);

      req.flash('success', 'User deleted successfully');
      res.redirect('/users');
      
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
  };