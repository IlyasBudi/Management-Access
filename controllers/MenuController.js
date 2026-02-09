// controllers/MenuController.js
const Menu = require('../models/Menu');

class MenuController {
  // Get all menus (flat)
  static async getAllMenus(req, res) {
    try {
      const menus = await Menu.findAll();
      
      res.status(200).json({
        success: true,
        message: 'Menus retrieved successfully',
        data: menus
      });
    } catch (error) {
      console.error('Get all menus error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve menus',
        error: error.message
      });
    }
  }

  // Get hierarchical menu structure
  static async getHierarchicalMenus(req, res) {
    try {
      const menus = await Menu.getHierarchical();
      
      res.status(200).json({
        success: true,
        message: 'Hierarchical menus retrieved successfully',
        data: menus
      });
    } catch (error) {
      console.error('Get hierarchical menus error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve hierarchical menus',
        error: error.message
      });
    }
  }

  // Get menu by ID
  static async getMenuById(req, res) {
    try {
      const { id } = req.params;
      const menu = await Menu.findById(id);

      if (!menu) {
        return res.status(404).json({
          success: false,
          message: 'Menu not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Menu retrieved successfully',
        data: menu
      });
    } catch (error) {
      console.error('Get menu by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve menu',
        error: error.message
      });
    }
  }

  // Get menu by code
  static async getMenuByCode(req, res) {
    try {
      const { code } = req.params;
      const menu = await Menu.findByCode(code);

      if (!menu) {
        return res.status(404).json({
          success: false,
          message: 'Menu not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Menu retrieved successfully',
        data: menu
      });
    } catch (error) {
      console.error('Get menu by code error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve menu',
        error: error.message
      });
    }
  }

  // Get menu children
  static async getMenuChildren(req, res) {
    try {
      const { id } = req.params;
      const children = await Menu.getChildren(id);

      res.status(200).json({
        success: true,
        message: 'Menu children retrieved successfully',
        data: children
      });
    } catch (error) {
      console.error('Get menu children error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve menu children',
        error: error.message
      });
    }
  }

  // Get menus by role ID
  static async getMenusByRole(req, res) {
    try {
      const { roleId } = req.params;
      const menus = await Menu.getByRoleId(roleId);

      res.status(200).json({
        success: true,
        message: 'Menus by role retrieved successfully',
        data: menus
      });
    } catch (error) {
      console.error('Get menus by role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve menus by role',
        error: error.message
      });
    }
  }

  // Create new menu
  static async createMenu(req, res) {
    try {
      const { menu_name, menu_code, parent_id, menu_order } = req.body;

      // Validation
      if (!menu_name || !menu_code) {
        return res.status(400).json({
          success: false,
          message: 'Menu name and code are required'
        });
      }

      // Check if menu code already exists
      const existingMenu = await Menu.findByCode(menu_code);
      if (existingMenu) {
        return res.status(409).json({
          success: false,
          message: 'Menu code already exists'
        });
      }

      // If parent_id is provided, verify parent exists
      if (parent_id) {
        const parentMenu = await Menu.findById(parent_id);
        if (!parentMenu) {
          return res.status(404).json({
            success: false,
            message: 'Parent menu not found'
          });
        }
      }

      const newMenu = await Menu.create({
        menu_name,
        menu_code,
        parent_id,
        menu_order
      });

      res.status(201).json({
        success: true,
        message: 'Menu created successfully',
        data: newMenu
      });
    } catch (error) {
      console.error('Create menu error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create menu',
        error: error.message
      });
    }
  }

  // Update menu
  static async updateMenu(req, res) {
    try {
      const { id } = req.params;
      const { menu_name, menu_code, parent_id, menu_order, is_active } = req.body;

      // Check if menu exists
      const existingMenu = await Menu.findById(id);
      if (!existingMenu) {
        return res.status(404).json({
          success: false,
          message: 'Menu not found'
        });
      }

      // If menu_code is being changed, check if new code already exists
      if (menu_code && menu_code !== existingMenu.menu_code) {
        const menuWithCode = await Menu.findByCode(menu_code);
        if (menuWithCode) {
          return res.status(409).json({
            success: false,
            message: 'Menu code already exists'
          });
        }
      }

      // If parent_id is provided, verify parent exists and prevent circular reference
      if (parent_id) {
        if (parent_id === parseInt(id)) {
          return res.status(400).json({
            success: false,
            message: 'Menu cannot be its own parent'
          });
        }
        
        const parentMenu = await Menu.findById(parent_id);
        if (!parentMenu) {
          return res.status(404).json({
            success: false,
            message: 'Parent menu not found'
          });
        }
      }

      const updatedMenu = await Menu.update(id, {
        menu_name,
        menu_code,
        parent_id,
        menu_order,
        is_active
      });

      res.status(200).json({
        success: true,
        message: 'Menu updated successfully',
        data: updatedMenu
      });
    } catch (error) {
      console.error('Update menu error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update menu',
        error: error.message
      });
    }
  }

  // Delete menu
  static async deleteMenu(req, res) {
    try {
      const { id } = req.params;

      // Check if menu exists
      const existingMenu = await Menu.findById(id);
      if (!existingMenu) {
        return res.status(404).json({
          success: false,
          message: 'Menu not found'
        });
      }

      // Check if menu has children
      const children = await Menu.getChildren(id);
      if (children && children.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete menu with children. Please delete or reassign children first'
        });
      }

      await Menu.delete(id);

      res.status(200).json({
        success: true,
        message: 'Menu deleted successfully'
      });
    } catch (error) {
      console.error('Delete menu error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete menu',
        error: error.message
      });
    }
  }
}

module.exports = MenuController;
