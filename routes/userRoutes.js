// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');

// Apply authentication to all user routes
router.use(authMiddleware);

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', checkPermission('can_create'), UserController.createUser);
router.put('/:id', checkPermission('can_update'), UserController.updateUser);
router.put('/:id/password', checkPermission('can_update'), UserController.updatePassword);
router.delete('/:id', checkPermission('can_delete'), UserController.deleteUser);
router.get('/:id/roles', UserController.getUserRoles);
router.post('/:id/roles', checkPermission('can_create'), UserController.assignRole);
router.delete('/:id/roles/:role_id', checkPermission('can_delete'), UserController.removeRole);

module.exports = router;
