// models/User.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class User {
  // Find user by username (untuk login)
  static async findByUsername(username) {
    const query = `
      SELECT id, username, password, full_name, is_active
      FROM users
      WHERE username = $1 AND is_active = true
    `;
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  // Get user with roles (untuk jabatan ganda)
  static async getUserWithRoles(userId) {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.full_name,
        u.is_active,
        json_agg(
          json_build_object(
            'role_id', r.id,
            'role_name', r.name,
            'description', r.description,
            'permissions', json_build_object(
              'can_create', ur.can_create,
              'can_read', ur.can_read,
              'can_update', ur.can_update,
              'can_delete', ur.can_delete
            )
          )
        ) FILTER (WHERE r.id IS NOT NULL) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      GROUP BY u.id
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Generate JWT Token
  static generateToken(payload, expiresIn = '24h') {
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn
    });
  }

  // Verify JWT Token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return null;
    }
  }

  // Login method dengan support multiple roles
  static async login(username, password) {
    // 1. Find user
    const user = await this.findByUsername(username);
    if (!user) {
      throw new Error('Username atau password salah');
    }

    // 2. Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Username atau password salah');
    }

    // 3. Get user with roles
    const userWithRoles = await this.getUserWithRoles(user.id);
    
    // 4. Check if user has roles
    if (!userWithRoles.roles || userWithRoles.roles.length === 0) {
      throw new Error('User tidak memiliki role');
    }

    // Remove password from response
    delete user.password;

    return {
      user: {
        id: userWithRoles.id,
        username: userWithRoles.username,
        full_name: userWithRoles.full_name
      },
      roles: userWithRoles.roles,
      requireRoleSelection: userWithRoles.roles.length > 1
    };
  }

  // Select role setelah login (untuk jabatan ganda)
  static async selectRole(userId, roleId) {
    // Verify user has this role
    const query = `
      SELECT ur.*, r.name as role_name, r.description
      FROM user_roles ur
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1 AND ur.role_id = $2
    `;
    const result = await pool.query(query, [userId, roleId]);
    
    if (result.rows.length === 0) {
      throw new Error('Role tidak valid untuk user ini');
    }

    const userRole = result.rows[0];

    // Generate JWT token dengan role yang dipilih
    const token = this.generateToken({
      user_id: userId,
      role_id: roleId,
      role_name: userRole.role_name
    });

    return {
      token,
      role: {
        id: userRole.role_id,
        name: userRole.role_name,
        description: userRole.description
      }
    };
  }

  // Get all users
  static async findAll() {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.full_name, 
        u.is_active,
        u.created_at,
        json_agg(
          json_build_object('id', r.id, 'name', r.name)
        ) FILTER (WHERE r.id IS NOT NULL) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Find user by ID
  static async findById(id) {
    return await this.getUserWithRoles(id);
  }

  // Create new user
  static async create(userData) {
    const { username, password, full_name } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (username, password, full_name)
      VALUES ($1, $2, $3)
      RETURNING id, username, full_name, is_active, created_at
    `;
    const result = await pool.query(query, [username, hashedPassword, full_name]);
    return result.rows[0];
  }

  // Update user
  static async update(id, userData) {
    const { username, full_name, is_active } = userData;
    
    const query = `
      UPDATE users
      SET username = COALESCE($1, username),
          full_name = COALESCE($2, full_name),
          is_active = COALESCE($3, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, username, full_name, is_active, updated_at
    `;
    const result = await pool.query(query, [username, full_name, is_active, id]);
    return result.rows[0];
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = `
      UPDATE users
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [hashedPassword, id]);
    return result.rows[0];
  }

  // Delete user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Assign role to user (untuk jabatan ganda)
  static async assignRole(userId, roleId, permissions = {}) {
    const {
      can_create = false,
      can_read = true,
      can_update = false,
      can_delete = false
    } = permissions;

    const query = `
      INSERT INTO user_roles (user_id, role_id, can_create, can_read, can_update, can_delete)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, role_id)
      DO UPDATE SET
        can_create = $3,
        can_read = $4,
        can_update = $5,
        can_delete = $6,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId,
      roleId,
      can_create,
      can_read,
      can_update,
      can_delete
    ]);
    return result.rows[0];
  }

  // Remove role from user
  static async removeRole(userId, roleId) {
    const query = `
      DELETE FROM user_roles 
      WHERE user_id = $1 AND role_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [userId, roleId]);
    return result.rows[0];
  }
}

module.exports = User;
