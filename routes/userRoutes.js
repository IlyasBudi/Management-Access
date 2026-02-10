// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authMiddleware, isSuperAdmin, isManager } = require('../middlewares/authMiddleware');

// Apply authentication to all user routes
router.use(authMiddleware);

// All user routes - only accessible by Super Admin
router.get('/', isManager, UserController.getAllUsers);
router.get('/:id', isManager, UserController.getUserById);
router.get('/:id/roles', isSuperAdmin, UserController.getUserRoles);
router.post('/', isSuperAdmin, UserController.createUser);
router.put('/:id', isSuperAdmin, UserController.updateUser);
router.put('/:id/password', isSuperAdmin, UserController.updatePassword);
router.delete('/:id', isSuperAdmin, UserController.deleteUser);
router.post('/:id/roles', isSuperAdmin, UserController.assignRole);
router.delete('/:id/roles/:role_id', isSuperAdmin, UserController.removeRole);

module.exports = router;