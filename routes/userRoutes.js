const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.get('/add-user', userController.getCreateUser);
router.post('/add-user', userController.postCreateUser);
router.get('/edit-user/:id', userController.getEditUser);
router.post('/update-user/:id', userController.postEditUser);
router.post('/delete-user/:id', userController.deleteUser);

module.exports = router