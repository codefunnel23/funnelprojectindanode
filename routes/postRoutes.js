const {Router} = require('express');
const postController = require('../controllers/postController');

const router = Router();

router.post('/create-post', postController.createPost);

router.post('/delete-post/:id', postController.deletePost);

router.put('/edit-post/:id', postController.editPost);

router.get('/posts', postController.allPosts);

router.get('/posts/:slug', postController.singlePost);

module.exports = router;