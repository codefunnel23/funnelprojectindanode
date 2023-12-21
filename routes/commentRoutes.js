const {Router} = require('express');
const commentController = require('../controllers/commentController');

const router = Router();

router.post('/create-comment', commentController.createComment);
router.get('/comments', commentController.allComments);
module.exports = router;