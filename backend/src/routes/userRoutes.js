const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Get all users
router.get('/', userController.getAllUsers);

// Create new user
router.post('/', userController.createUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

// Change user password
router.put('/:id/password', userController.changePassword);

module.exports = router;
