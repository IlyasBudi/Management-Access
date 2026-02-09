// controllers/UserController.js
const User = require('../models/User');

class UserController {
  // Get all users
  static async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      
      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users',
        error: error.message
      });
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user',
        error: error.message
      });
    }
  }

  // Create new user
  static async createUser(req, res) {
    try {
      const { username, password, full_name } = req.body;

      // Validation
      if (!username || !password || !full_name) {
        return res.status(400).json({
          success: false,
          message: 'Username, password, and full_name are required'
        });
      }

      // Check if username already exists
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists'
        });
      }

      const user = await User.create({ username, password, full_name });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      });
    }
  }

  // Update user
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, full_name, is_active } = req.body;

      // Check if user exists
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if new username already taken by another user
      if (username) {
        const userWithUsername = await User.findByUsername(username);
        if (userWithUsername && userWithUsername.id !== parseInt(id)) {
          return res.status(409).json({
            success: false,
            message: 'Username already taken'
          });
        }
      }

      const updatedUser = await User.update(id, { username, full_name, is_active });

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message
      });
    }
  }

  // Update user password
  static async updatePassword(req, res) {
    try {
      const { id } = req.params;
      const { new_password } = req.body;

      if (!new_password) {
        return res.status(400).json({
          success: false,
          message: 'New password is required'
        });
      }

      if (new_password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }

      // Check if user exists
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await User.updatePassword(id, new_password);

      res.status(200).json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update password',
        error: error.message
      });
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Check if user exists
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await User.delete(id);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      });
    }
  }

  // Get user roles
  static async getUserRoles(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.getUserWithRoles(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User roles retrieved successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            is_active: user.is_active
          },
          roles: user.roles || []
        }
      });
    } catch (error) {
      console.error('Get user roles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user roles',
        error: error.message
      });
    }
  }

  // Assign role to user
  static async assignRole(req, res) {
    try {
      const { id } = req.params;
      const { role_id } = req.body;

      if (!role_id) {
        return res.status(400).json({
          success: false,
          message: 'Role ID is required'
        });
      }

      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const result = await User.assignRole(id, role_id);

      res.status(200).json({
        success: true,
        message: 'Role assigned to user successfully',
        data: result
      });
    } catch (error) {
      console.error('Assign role error:', error);
      
      if (error.message.includes('foreign key')) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to assign role to user',
        error: error.message
      });
    }
  }

  // Remove role from user
  static async removeRole(req, res) {
    try {
      const { id, role_id } = req.params;

      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const result = await User.removeRole(id, role_id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'User does not have this role'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Role removed from user successfully',
        data: result
      });
    } catch (error) {
      console.error('Remove role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove role from user',
        error: error.message
      });
    }
  }
}

module.exports = UserController;
