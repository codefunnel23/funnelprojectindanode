const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Role } = require('@prisma/client');

const requireAuth = (req, res, next) => {

    const token = req.cookies.jwt;

    // Check if it's an API route
    if (req.originalUrl.startsWith('/api')) {
        // Skip authentication for APIs
        return next();
    }

    // check jwt exist & is verified
    if(token){
        jwt.verify(token, 'some secret word or something', (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login');
            }
            else{
                console.log(decodedToken);
                next();
            }
        });
    }
    else{
        res.redirect('/login');
    }
}

// check current user
// const checkUser = (req, res, next) => {
//     const token = req.cookies.jwt;

//     if(token){
//         jwt.verify(token, 'some secret word or something', async (err, decodedToken) => {
//             if (err) {
//                 console.log(err.message);
//                 res.locals.user = null;
//                 next();
//             }
//             else{
//                 console.log(decodedToken);
//                 let user = await User.findById(decodedToken.id).populate({ path: 'roles', populate: { path: 'permissions' } });

//                 // Access the permissions directly from the populated roles
//                 const permissions = user.roles.length > 0 ? user.roles[0].permissions : [];

//                 let permissionsList = ['/', '/register', '/login', '/logout', '/uploads', '/visitor-days-data', '/visitor-year-data', '/favicon.ico'];

//                 permissions.forEach(element => {
//                     permissionsList.push(element.name);
//                 });

//                 console.log('USER Permissions', permissionsList);

//                 res.locals.user = user;
//                 res.locals.permissions = permissionsList;
//                 req.session.permissions = permissionsList;
//                 next();
//             }
//         });
//     }
//     else {
//         res.locals.user = null;
//         next();
//     }
// }

const checkUser = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, 'some secret word or something', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            } else {
                try {
                    console.log(decodedToken);
                    let user = await User.findById(decodedToken.id).populate({ path: 'roles', populate: { path: 'permissions' } });

                    if (!user) {
                        // Handle the case where the user is not found
                        console.log('User not found');
                        res.locals.user = null;
                        next();
                        return;
                    }

                    // Access the permissions directly from the populated roles
                    const permissions = user.roles.length > 0 ? user.roles[0].permissions : [];

                    let permissionsList = ['/', '/register', '/login', '/logout', '/uploads', '/visitor-days-data', '/visitor-year-data', '/favicon.ico'];

                    permissions.forEach(element => {
                        permissionsList.push(element.name);
                    });

                    console.log('USER Permissions', permissionsList);

                    res.locals.user = user;
                    res.locals.permissions = permissionsList;
                    req.session.permissions = permissionsList;
                    next();
                } catch (error) {
                    // Handle any other errors that might occur during the database query
                    console.error('Error fetching user:', error);
                    res.locals.user = null;
                    next();
                }
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};

module.exports = { requireAuth, checkUser };