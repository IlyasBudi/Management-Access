// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/RoleController');
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');

// Apply authentication to all role routes
router.use(authMiddleware);

router.get('/', RoleController.getAllRoles);
router.get('/:id', RoleController.getRoleById);
router.get('/:id/details', RoleController.getRoleDetails);
router.post('/', checkPermission('can_create'), RoleController.createRole);
router.put('/:id', checkPermission('can_update'), RoleController.updateRole);
router.delete('/:id', checkPermission('can_delete'), RoleController.deleteRole);

// ==================== USER MANAGEMENT ====================
router.get('/:id/users', RoleController.getRoleUsers);
router.post('/:id/users', checkPermission('can_create'), RoleController.assignUser);
router.delete('/:id/users/:user_id', checkPermission('can_delete'), RoleController.removeUser);
router.post('/:id/users/bulk-assign', checkPermission('can_create'), RoleController.bulkAssignUsers);
router.post('/:id/users/bulk-remove', checkPermission('can_delete'), RoleController.bulkRemoveUsers);

// ==================== MENU MANAGEMENT ====================
router.get('/:id/menus', RoleController.getRoleMenus);
router.post('/:id/menus', checkPermission('can_create'), RoleController.assignMenu);
router.delete('/:id/menus/:menu_id', checkPermission('can_delete'), RoleController.removeMenu);

module.exports = router;
