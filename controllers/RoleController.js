// controllers/RoleController.js
const Role = require('../models/Role');

class RoleController {
  // Get all roles
  static async getAllRoles(req, res) {
    try {
      const roles = await Role.findAll();
      
      res.status(200).json({
        success: true,
        message: 'Roles retrieved successfully',
        data: roles
      });
    } catch (error) {
      console.error('Get all roles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve roles',
        error: error.message
      });
    }
  }

  // Get role by ID
  static async getRoleById(req, res) {
    try {
      const { id } = req.params;
      const role = await Role.findById(id);

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Role retrieved successfully',
        data: role
      });
    } catch (error) {
      console.error('Get role by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve role',
        error: error.message
      });
    }
  }

  // Get role details (with users and menus)
  static async getRoleDetails(req, res) {
    try {
      const { id } = req.params;
      const roleDetails = await Role.getRoleDetails(id);

      if (!roleDetails) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Role details retrieved successfully',
        data: roleDetails
      });
    } catch (error) {
      console.error('Get role details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve role details',
        error: error.message
      });
    }
  }

  // Create new role
  static async createRole(req, res) {
    try {
      const { name, description } = req.body;

      // Validation
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Role name is required'
        });
      }

      // Check if role name already exists
      const existingRole = await Role.findByName(name);
      if (existingRole) {
        return res.status(409).json({
          success: false,
          message: 'Role name already exists'
        });
      }

      const role = await Role.create({ name, description });

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: role
      });
    } catch (error) {
      console.error('Create role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create role',
        error: error.message
      });
    }
  }

  // Update role
  static async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      // Check if role exists
      const existingRole = await Role.findById(id);
      if (!existingRole) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      // Check if new name already taken by another role
      if (name) {
        const roleWithName = await Role.findByName(name);
        if (roleWithName && roleWithName.id !== parseInt(id)) {
          return res.status(409).json({
            success: false,
            message: 'Role name already taken'
          });
        }
      }

      const updatedRole = await Role.update(id, { name, description });

      res.status(200).json({
        success: true,
        message: 'Role updated successfully',
        data: updatedRole
      });
    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update role',
        error: error.message
      });
    }
  }

  // Delete role
  static async deleteRole(req, res) {
    try {
      const { id } = req.params;

      // Check if role exists
      const existingRole = await Role.findById(id);
      if (!existingRole) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      await Role.delete(id);

      res.status(200).json({
        success: true,
        message: 'Role deleted successfully'
      });
    } catch (error) {
      console.error('Delete role error:', error);
      
      // Handle error when role still has users
      if (error.message.includes('memiliki user')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete role',
        error: error.message
      });
    }
  }

  // Get users with this role
  static async getRoleUsers(req, res) {
    try {
      const { id } = req.params;

      // Check if role exists
      const exists = await Role.exists(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      const users = await Role.getUsers(id);

      res.status(200).json({
        success: true,
        message: 'Role users retrieved successfully',
        data: users
      });
    } catch (error) {
      console.error('Get role users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve role users',
        error: error.message
      });
    }
  }

  // Assign user to role
  static async assignUser(req, res) {
    try {
      const { id } = req.params;
      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      // Check if role exists
      const exists = await Role.exists(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      const result = await Role.assignUser(id, user_id);

      res.status(200).json({
        success: true,
        message: 'User assigned to role successfully',
        data: result
      });
    } catch (error) {
      console.error('Assign user error:', error);
      
      if (error.message.includes('foreign key')) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to assign user to role',
        error: error.message
      });
    }
  }

  // Remove user from role
  static async removeUser(req, res) {
    try {
      const { id, user_id } = req.params;

      // Check if role exists
      const exists = await Role.exists(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      const result = await Role.removeUser(id, user_id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'User does not have this role'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User removed from role successfully',
        data: result
      });
    } catch (error) {
      console.error('Remove user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove user from role',
        error: error.message
      });
    }
  }

  // Bulk assign users to role
  static async bulkAssignUsers(req, res) {
    try {
      const { id } = req.params;
      const { user_ids } = req.body;

      if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User IDs array is required'
        });
      }

      // Check if role exists
      const exists = await Role.exists(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      const results = await Role.bulkAssignUsers(id, user_ids);

      res.status(200).json({
        success: true,
        message: `${results.length} users assigned to role successfully`,
        data: results
      });
    } catch (error) {
      console.error('Bulk assign users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign users to role',
        error: error.message
      });
    }
  }

  // Bulk remove users from role
  static async bulkRemoveUsers(req, res) {
    try {
      const { id } = req.params;
      const { user_ids } = req.body;

      if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User IDs array is required'
        });
      }

      // Check if role exists
      const exists = await Role.exists(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      const results = await Role.bulkRemoveUsers(id, user_ids);

      res.status(200).json({
        success: true,
        message: `${results.length} users removed from role successfully`,
        data: results
      });
    } catch (error) {
      console.error('Bulk remove users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove users from role',
        error: error.message
      });
    }
  }

  // Get menus accessible by this role
  static async getRoleMenus(req, res) {
    try {
      const { id } = req.params;

      // Check if role exists
      const exists = await Role.exists(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      const menus = await Role.getMenus(id);

      res.status(200).json({
        success: true,
        message: 'Role menus retrieved successfully',
        data: menus
      });
    } catch (error) {
      console.error('Get role menus error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve role menus',
        error: error.message
      });
    }
  }

  // Assign menu to role with permissions
  static async assignMenu(req, res) {
    try {
      const { id } = req.params;
      const { menu_id, can_create, can_read, can_update, can_delete } = req.body;

      if (!menu_id) {
        return res.status(400).json({
          success: false,
          message: 'Menu ID is required'
        });
      }

      // Check if role exists
      const exists = await Role.exists(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      const permissions = {
        can_create: can_create || false,
        can_read: can_read !== undefined ? can_read : true,
        can_update: can_update || false,
        can_delete: can_delete || false
      };

      const result = await Role.assignMenu(id, menu_id, permissions);

      res.status(200).json({
        success: true,
        message: 'Menu assigned to role successfully',
        data: result
      });
    } catch (error) {
      console.error('Assign menu error:', error);
      
      if (error.message.includes('foreign key')) {
        return res.status(404).json({
          success: false,
          message: 'Menu not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to assign menu to role',
        error: error.message
      });
    }
  }

  // Remove menu from role
  static async removeMenu(req, res) {
    try {
      const { id, menu_id } = req.params;

      // Check if role exists
      const exists = await Role.exists(id);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      const result = await Role.removeMenu(id, menu_id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Menu not assigned to this role'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Menu removed from role successfully',
        data: result
      });
    } catch (error) {
      console.error('Remove menu error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove menu from role',
        error: error.message
      });
    }
  }
}

module.exports = RoleController;
