// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authMiddleware, checkRoles } = require('../middlewares/authMiddleware');

// Apply authentication to all user routes
router.use(authMiddleware);

// All user routes - accessible by Super Admin and Manager
router.get('/', checkRoles('Super Admin', 'Manager'), UserController.getAllUsers);
router.get('/:id', checkRoles('Super Admin', 'Manager'), UserController.getUserById);
router.get('/:id/roles', checkRoles('Super Admin'), UserController.getUserRoles);
router.post('/', checkRoles('Super Admin'), UserController.createUser);
router.put('/:id', checkRoles('Super Admin'), UserController.updateUser);
router.put('/:id/password', checkRoles('Super Admin'), UserController.updatePassword);
router.delete('/:id', checkRoles('Super Admin'), UserController.deleteUser);
router.post('/:id/roles', checkRoles('Super Admin'), UserController.assignRole);
router.delete('/:id/roles/:role_id', checkRoles('Super Admin'), UserController.removeRole);

module.exports = router;