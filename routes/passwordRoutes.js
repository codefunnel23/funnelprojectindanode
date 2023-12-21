const {Router} = require('express');
const passwordController = require('../controllers/passwordController');

const router = Router();

// router.route('/forgot-password')
//     .get(passwordController.forgot_password)
//     .post(passwordController.sendForgotPasswordLink);

// router.route('/reset-password/:userId/:token')
//     .get(passwordController.getResetPasswordView)
//     .post(passwordController.resetThePassword);

module.exports = router;