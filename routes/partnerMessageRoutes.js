const {Router} = require('express');
const partnerMessageController = require('../controllers/partnerMessageController');

const router = Router();

router.post('/create-partner-message', partnerMessageController.createPartnerMessage);

module.exports = router;