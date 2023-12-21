const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '' };

    // incorrect email
    if(err.message === 'incorrect email'){
        errors.email = 'that email is not registered';
    }

    // validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}

module.exports.forgot_password = async (req, res) => {
    res.render('forgot-password', {layout: 'loginlayout'});
}

module.exports.sendForgotPasswordLink = async (req, res) => {

    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if(!user){
            req.flash('error', 'please enter valid email!');
            res.redirect('/forgot-password');
            // res.status(404).json({error: 'user not found'});
        }
        const secret = process.env.JWT_SECRET_KEY + user.password;
        const token = jwt.sign({ email: user.email, id: user._id }, secret, {
            expiresIn:'10m'
        });

        const link = `http://localhost:3001/reset-password/${user._id}/${token}`;

        // send link to user email

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: "taouiladil026@gmail.com",
            to: user.email,
            subject: "Reset password",
            html: `<div>
                    <h4>Click on the link to reset your password</h4>
                    <a href="${link}">${link}</a>
                </div>`
        }

        transporter.sendMail(mailOptions, function(error, success) {
            if (error) {
                console.log(error);
            }else{
                console.log('Email sent: ' + success.response);
            }
        });
        req.flash('success', 'Email sent, please check your email inbox');
        res.redirect('/forgot-password');

    } catch (err) {
        console.log(err);
        // const errors = handleErrors(err);
        // res.status(400).json({ errors });
    }
}

module.exports.getResetPasswordView = async (req, res) => {

    const user = await User.findById(req.params.userId);
    if(!user){
        res.status(404).json({error: 'user not found'});
    }
    const secret = process.env.JWT_SECRET_KEY + user.password;

    try {
        jwt.verify(req.params.token, secret);
        res.render('reset-password', { email: user.email, layout: 'loginlayout' });
    } catch (err) {
        console.log(err);
    }

}


module.exports.resetThePassword = asyncHandler(async (req, res) => {
    // TODO: Validation
    const user = await User.findById(req.params.userId);
    console.log("====>" + req.params.userId);
    if(!user){
        res.status(404).json({error: 'user not found'});
    }
    const secret = process.env.JWT_SECRET_KEY + user.password;

    try {

        jwt.verify(req.params.token, secret);

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt);

        const filter = { _id: req.params.userId };
        const update = { password: password };

        const updateUser = await User.findOneAndUpdate(filter, update);
        console.log(updateUser);

        req.flash('success', 'Password reset successfully, please log in');
        res.redirect('/login');
        
    } catch (err) {
        req.flash('error', err);
        res.redirect('/forgot-password');
    }

})