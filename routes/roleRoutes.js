// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/RoleController');
const { authMiddleware, isSuperAdmin } = require('../middlewares/authMiddleware');

// Apply authentication to all role routes
router.use(authMiddleware);

// All role routes - only accessible by Super Admin
router.get('/', isSuperAdmin, RoleController.getAllRoles);
router.get('/:id', isSuperAdmin, RoleController.getRoleById);
router.get('/:id/details', isSuperAdmin, RoleController.getRoleDetails);
router.get('/:id/users', isSuperAdmin, RoleController.getRoleUsers);
router.get('/:id/menus', isSuperAdmin, RoleController.getRoleMenus);
router.post('/', isSuperAdmin, RoleController.createRole);
router.put('/:id', isSuperAdmin, RoleController.updateRole);
router.delete('/:id', isSuperAdmin, RoleController.deleteRole);

// ==================== USER MANAGEMENT - Super Admin Only ====================
router.post('/:id/users', isSuperAdmin, RoleController.assignUser);
router.delete('/:id/users/:user_id', isSuperAdmin, RoleController.removeUser);
router.post('/:id/users/bulk-assign', isSuperAdmin, RoleController.bulkAssignUsers);
router.post('/:id/users/bulk-remove', isSuperAdmin, RoleController.bulkRemoveUsers);

// ==================== MENU MANAGEMENT - Super Admin Only ====================
router.post('/:id/menus', isSuperAdmin, RoleController.assignMenu);
router.delete('/:id/menus/:menu_id', isSuperAdmin, RoleController.removeMenu);

module.exports = router;
