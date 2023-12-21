const {Router} = require('express');
const authController = require('../controllers/authController');
const passwordController = require('../controllers/passwordController');
const homeController = require('../controllers/homeController');

const router = Router();

router.get('/register', authController.signup_get);
router.post('/register', authController.signup_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);
router.route('/forgot-password')
    .get(passwordController.forgot_password)
    .post(passwordController.sendForgotPasswordLink);

router.route('/reset-password/:userId/:token')
    .get(passwordController.getResetPasswordView)
    .post(passwordController.resetThePassword);


router.get('/visitor-days-data', homeController.visitorChartData);
router.get('/visitor-year-data', homeController.visitorChartDataYear);

module.exports = router;