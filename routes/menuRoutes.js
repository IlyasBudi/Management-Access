// routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/MenuController');
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');

// Apply authentication to all menu routes
router.use(authMiddleware);

router.get('/', MenuController.getAllMenus);
router.get('/hierarchical', MenuController.getHierarchicalMenus);
router.get('/role/:roleId', MenuController.getMenusByRole);
router.get('/code/:code', MenuController.getMenuByCode);
router.get('/:id', MenuController.getMenuById);
router.get('/:id/children', MenuController.getMenuChildren);
router.post('/', checkPermission('can_create'), MenuController.createMenu);
router.put('/:id', checkPermission('can_update'), MenuController.updateMenu);
router.delete('/:id', checkPermission('can_delete'), MenuController.deleteMenu);

module.exports = router;
