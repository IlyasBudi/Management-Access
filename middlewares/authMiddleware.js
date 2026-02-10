// middlewares/auth.middleware.js
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = User.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau sudah expired'
      });
    }

    // Attach user info to request
    req.user = {
      user_id: decoded.user_id,
      role_id: decoded.role_id,
      role_name: decoded.role_name
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      error: error.message
    });
  }
};

// Middleware to check specific permission
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const { role_id } = req.user;
      const menuId = req.params.menuId || req.body.menu_id;

      if (!menuId) {
        return next();
      }

      const RoleMenu = require('../models/RoleMenu');
      const hasAccess = await RoleMenu.hasAccess(role_id, menuId, permission);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses untuk melakukan aksi ini'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking permission',
        error: error.message
      });
    }
  };
};

// Middleware to check if user is Super Admin
const isSuperAdmin = async (req, res, next) => {
  try {
    const { role_name } = req.user;

    if (role_name !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya Super Admin yang dapat melakukan operasi ini.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking role',
      error: error.message
    });
  }
};

// Middleware to check if user is Manager
const isManager = async (req, res, next) => {
  try {
    const { role_name } = req.user;

    if (role_name !== 'Manager') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya Manager yang dapat melakukan operasi ini.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking role',
      error: error.message
    });
  }
};

module.exports = { authMiddleware, checkPermission, isSuperAdmin, isManager };
