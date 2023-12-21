const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// List of routes
const routes = [
  '/users',
  '/add-user',
  '/edit-user',
  '/update-user',
  '/delete-user',

  '/posts',
  '/add-post',
  '/edit-post',
  '/view-post',
  '/delete-post',

  '/testimonials',
  '/add-testimonial',
  '/edit-testimonial',
  '/delete-testimonial',
  '/view-testimonial',

  '/visitors',

  '/messages',
  '/view-message',
  '/delete-message',

  '/comments',
  '/delete-comment',
  '/edit-comment',
  '/view-comment',

  '/roles',
  '/add-role',
  '/edit-role',
  '/delete-role',

  '/permissions',
  '/add-permission',
  '/edit-permission',
  '/delete-permission',

  //This permissions de
  '/feedbacks',
  '/edit-feedback',
  '/view-feedback',
  '/delete-feedback',

  '/partner-messages',
  '/view-partner-message',
  '/delete-partner-message',
];

// Function to seed the database
const seedPermissions = async () => {
  try {
    // Get existing permissions from the database
    const existingPermissions = await Permission.find({}).maxTimeMS(30000);

    // Extract the names of existing permissions
    const existingPermissionNames = existingPermissions.map(permission => permission.name);

    // Find permissions to add (in routes but not in the database)
    const permissionsToAdd = routes.filter(route => !existingPermissionNames.includes(route));

    // Find permissions to remove (in the database but not in routes)
    // const permissionsToRemove = existingPermissionNames.filter(name => !routes.includes(name));
    const permissionsToRemove = existingPermissions.filter(permission => !routes.includes(permission.name));

    // Remove permissions not in routes
    // if (permissionsToRemove.length > 0) {
    //   await Permission.deleteMany({ name: { $in: permissionsToRemove } });
    // }
    if (permissionsToRemove.length > 0) {
      const permissionIdsToRemove = permissionsToRemove.map(permission => permission._id);
      await Permission.deleteMany({ _id: { $in: permissionIdsToRemove } });
    }

    // Add new permissions
    const newPermissions = permissionsToAdd.map(route => ({ name: route }));
    await Permission.insertMany(newPermissions);

    console.log('Permissions seeder executed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Function to seed the database
const seedPermissionsAndRole = async () => {
  try {
    // Check if "superadmin" role already exists
    let superadminRole = await Role.findOne({ name: 'super__admin' });

    // If the role doesn't exist, create it
    if (!superadminRole) {
      superadminRole = await Role.create({ name: 'super__admin' });
    }

    // Fetch all permissions
    const allPermissions = await Permission.find();

    // Assign all permissions to the "superadmin" role
    superadminRole.permissions = allPermissions.map(permission => permission._id);
    await superadminRole.save();

    console.log('Superadmin role created and permissions assigned successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Function to seed the database with a super admin user
const seedSuperAdminUser = async () => {
  try {
    // Load email and password from the .env file
    const superAdminEmailEnv = process.env.SUPER_ADMIN_EMAIL || 'super__admin@example.com';
    const superAdminPasswordEnv = process.env.SUPER_ADMIN_PASSWORD || '123456789';

    // Find the "super__admin" role
    const superadminRole = await Role.findOne({ name: 'super__admin' });

    // If the role doesn't exist, you may want to handle this case accordingly
    if (!superadminRole) {
      console.error('Error: "super__admin" role not found.');
      return;
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email: superAdminEmailEnv });

    if (existingUser) {
      // If the user exists, update fields

      existingUser.email = superAdminEmailEnv;
      existingUser.password = superAdminPasswordEnv;
      // You may update other fields as needed

      // Save the changes
      await existingUser.save();
      console.log('User updated successfully.');
    } else {
      // If the user doesn't exist, create it
      // Create the user with the specified email, hashed password, and assigned role
      const newUser = await User.create({
        name: 'Super__Admin',
        email: superAdminEmailEnv,
        password: superAdminPasswordEnv,
        roles: superadminRole._id,
      });

      console.log('Super admin user created successfully:', newUser);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};


module.exports = {seedPermissions, seedPermissionsAndRole, seedSuperAdminUser};