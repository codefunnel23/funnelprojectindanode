const {Router} = require('express');
const feedbackController = require('../controllers/feedbackController');

const router = Router();

router.post('/create-feedback', feedbackController.createFeedback);

module.exports = router;