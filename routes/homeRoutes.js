const {Router} = require('express');
const homeController = require('../controllers/homeController');
const postController = require('../controllers/postController');
const testimonialController = require('../controllers/testimonialController');
const messageController = require('../controllers/messageController');
const commentController = require('../controllers/commentController');
const roleController = require('../controllers/roleController');
const permissionController = require('../controllers/permissionController');
const feedbackController = require('../controllers/feedbackController');
const partnerMessageController = require('../controllers/partnerMessageController');

const router = Router();

router.get('/', homeController.indexView);
router.get('/users', homeController.usersView);
router.get('/posts', homeController.postsView);
router.get('/testimonials', homeController.testimonialView);
router.get('/visitors', homeController.visitorsView);
router.get('/messages', homeController.messagesView);
router.get('/comments', homeController.commentsView);
router.get('/roles', homeController.rolesView);
router.get('/permissions', homeController.permissionsView);
router.get('/feedbacks', homeController.feedbacksView);
router.get('/partner-messages', homeController.partnerMessageView);

// posts
router.get('/add-post', postController.getCreatePost);
router.post('/add-post', postController.postCreatePost);
router.get('/edit-post/:id', postController.getEditPost);
router.post('/edit-post/:id', postController.postEditPost);
router.get('/view-post/:id', postController.getViewPost);
router.post('/delete-post/:id', postController.postDeletePost);

// testimonials
router.get('/add-testimonial', testimonialController.getCreateTestimonial);
router.post('/add-testimonial', testimonialController.postCreateTestimonial);
router.get('/edit-testimonial/:id', testimonialController.getEditTestimonial);
router.post('/edit-testimonial/:id', testimonialController.postEditTestimonial);
router.post('/delete-testimonial/:id', testimonialController.postDeleteTestimonial);
router.get('/view-testimonial/:id', testimonialController.getViewTestimonial);

// messages
router.post('/delete-message/:id', messageController.postDeleteMessage);
router.get('/view-message/:id', messageController.getViewMessage);

// comments
router.post('/delete-comment/:id', commentController.postDeleteComment);
router.get('/edit-comment/:id', commentController.getEditComment);
router.post('/edit-comment/:id', commentController.postEditComment);
router.get('/view-comment/:id', commentController.getViewComment);

// roles
router.get('/add-role', roleController.getCreateRole);
router.post('/add-role', roleController.postCreateRole);
router.get('/edit-role/:id', roleController.getEditRole);
router.post('/edit-role/:id', roleController.postEditRole);
router.post('/delete-role/:id', roleController.postDeleteRole);

// permissions
router.get('/add-permission', permissionController.getCreatePermission);
router.post('/add-permission', permissionController.postCreatePermission);
router.get('/edit-permission/:id', permissionController.getEditPermission);
router.post('/edit-permission/:id', permissionController.postEditPermission);
router.post('/delete-permission/:id', permissionController.postDeletePermission);

// feedbacks
router.get('/edit-feedback/:id', feedbackController.getEditFeedback);
router.post('/edit-feedback/:id', feedbackController.postEditFeedback);
router.get('/view-feedback/:id', feedbackController.getViewFeedback);
router.post('/delete-feedback/:id', feedbackController.postDeleteFeedback);

// partner messages
router.get('/view-partner-message/:id', partnerMessageController.getViewPartnerMessage);
router.post('/delete-partner-message/:id', partnerMessageController.postDeletePartnerMessage);


module.exports = router;