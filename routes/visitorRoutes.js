const {Router} = require('express');
const visitorController = require('../controllers/visitorController');

const router = Router();

router.post('/create-visitor', visitorController.createVisitor);

router.get('/visitors', visitorController.allVisitors);

module.exports = router;