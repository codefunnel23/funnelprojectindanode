const {Router} = require('express');
const messageController = require('../controllers/messageController');

const router = Router();

router.post('/create-message', messageController.createMessage);

router.get('/messages', messageController.allMessages);

router.post('/delete-message/:id', messageController.deleteMessage);

module.exports = router;