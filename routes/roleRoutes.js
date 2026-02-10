// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/RoleController');
const { authMiddleware, checkRoles } = require('../middlewares/authMiddleware');

// Apply authentication to all role routes
router.use(authMiddleware);

// All role routes - only accessible by Super Admin
router.get('/', checkRoles('Super Admin'), RoleController.getAllRoles);
router.get('/:id', checkRoles('Super Admin'), RoleController.getRoleById);
router.get('/:id/details', checkRoles('Super Admin'), RoleController.getRoleDetails);
router.get('/:id/users', checkRoles('Super Admin'), RoleController.getRoleUsers);
router.get('/:id/menus', checkRoles('Super Admin'), RoleController.getRoleMenus);
router.post('/', checkRoles('Super Admin'), RoleController.createRole);
router.put('/:id', checkRoles('Super Admin'), RoleController.updateRole);
router.delete('/:id', checkRoles('Super Admin'), RoleController.deleteRole);

// ==================== USER MANAGEMENT - Super Admin Only ====================
router.post('/:id/users', checkRoles('Super Admin'), RoleController.assignUser);
router.delete('/:id/users/:user_id', checkRoles('Super Admin'), RoleController.removeUser);
router.post('/:id/users/bulk-assign', checkRoles('Super Admin'), RoleController.bulkAssignUsers);
router.post('/:id/users/bulk-remove', checkRoles('Super Admin'), RoleController.bulkRemoveUsers);

// ==================== MENU MANAGEMENT - Super Admin Only ====================
router.post('/:id/menus', checkRoles('Super Admin'), RoleController.assignMenu);
router.delete('/:id/menus/:menu_id', checkRoles('Super Admin'), RoleController.removeMenu);

module.exports = router;