// controllers/AuthController.js
const User = require('../models/User');
const Menu = require('../models/Menu');
const Role = require('../models/Role');

class AuthController {

  // Login - Step 1
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username dan password harus diisi'
        });
      }

      const loginResult = await User.login(username, password);

      // Jika user punya multiple roles, kirim roles untuk dipilih
      if (loginResult.requireRoleSelection) {
        return res.json({
          success: true,
          message: 'Silakan pilih role',
          data: {
            user: loginResult.user,
            roles: loginResult.roles,
            requireRoleSelection: true
          }
        });
      }

      // Jika hanya 1 role, langsung select role dan kirim token + menu
      const roleSelection = await User.selectRole(
        loginResult.user.id,
        loginResult.roles[0].role_id
      );

      const menus = await Menu.getByRoleId(loginResult.roles[0].role_id);

      return res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          user: loginResult.user,
          role: roleSelection.role,
          token: roleSelection.token,
          menus: menus
        }
      });

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // Select Role - Step 2 (untuk jabatan ganda)
  static async selectRole(req, res) {
    try {
      const { user_id, role_id } = req.body;

      if (!user_id || !role_id) {
        return res.status(400).json({
          success: false,
          message: 'user_id dan role_id harus diisi'
        });
      }

      const roleSelection = await User.selectRole(user_id, role_id);
      const menus = await Menu.getByRoleId(role_id);
      const user = await User.findById(user_id);

      return res.json({
        success: true,
        message: 'Role berhasil dipilih',
        data: {
          user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name
          },
          role: roleSelection.role,
          token: roleSelection.token,
          menus: menus
        }
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get current user info
  static async profile(req, res) {
    try {
      const { user_id, role_id } = req.user;

      const user = await User.findById(user_id);
      const menus = await Menu.getByRoleId(role_id);

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name
          },
          current_role: req.user.role_name,
          available_roles: user.roles,
          menus: menus
        }
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Refresh token
  static async refreshToken(req, res) {
    try {
      const { user_id, role_id } = req.user;

      // Generate new token
      const token = User.generateToken({
        user_id,
        role_id,
        role_name: req.user.role_name
      });

      res.json({
        success: true,
        message: 'Token berhasil di-refresh',
        data: { token }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      // Dalam implementasi JWT stateless, logout biasanya handled di client side
      // Client harus menghapus token dari localStorage/sessionStorage
      
      res.json({
        success: true,
        message: 'Logout berhasil'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AuthController;
