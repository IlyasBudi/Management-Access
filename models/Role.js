// models/Role.js
const pool = require('../config/database');

class Role {
  // Get all roles
  static async findAll() {
    const query = `
      SELECT 
        r.*,
        COUNT(DISTINCT ur.user_id) as user_count,
        COUNT(DISTINCT rm.menu_id) as menu_count
      FROM roles r
      LEFT JOIN user_roles ur ON r.id = ur.role_id
      LEFT JOIN role_menus rm ON r.id = rm.role_id
      GROUP BY r.id
      ORDER BY r.name
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Find role by ID
  static async findById(id) {
    const query = 'SELECT * FROM roles WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find role by name
  static async findByName(name) {
    const query = 'SELECT * FROM roles WHERE name = $1';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  // Get role with users
  static async getRoleWithUsers(roleId) {
    const query = `
      SELECT 
        r.*,
        json_agg(
          json_build_object(
            'user_id', u.id,
            'username', u.username,
            'full_name', u.full_name,
            'is_active', u.is_active,
            'permissions', json_build_object(
              'can_create', ur.can_create,
              'can_read', ur.can_read,
              'can_update', ur.can_update,
              'can_delete', ur.can_delete
            )
          )
        ) FILTER (WHERE u.id IS NOT NULL) as users
      FROM roles r
      LEFT JOIN user_roles ur ON r.id = ur.role_id
      LEFT JOIN users u ON ur.user_id = u.id
      WHERE r.id = $1
      GROUP BY r.id
    `;
    const result = await pool.query(query, [roleId]);
    return result.rows[0];
  }

  // Get role with menus
  static async getRoleWithMenus(roleId) {
    const query = `
      SELECT 
        r.*,
        json_agg(
          json_build_object(
            'menu_id', m.id,
            'menu_name', m.menu_name,
            'menu_code', m.menu_code,
            'parent_id', m.parent_id,
            'can_create', rm.can_create,
            'can_read', rm.can_read,
            'can_update', rm.can_update,
            'can_delete', rm.can_delete
          ) ORDER BY m.menu_order
        ) FILTER (WHERE m.id IS NOT NULL) as menus
      FROM roles r
      LEFT JOIN role_menus rm ON r.id = rm.role_id
      LEFT JOIN menus m ON rm.menu_id = m.id
      WHERE r.id = $1
      GROUP BY r.id
    `;
    const result = await pool.query(query, [roleId]);
    return result.rows[0];
  }

  // Get role with complete details (users + menus)
  static async getRoleDetails(roleId) {
    const role = await this.findById(roleId);
    if (!role) return null;

    // Get users with this role
    const usersQuery = `
      SELECT u.id, u.username, u.full_name, u.is_active
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.role_id = $1
      ORDER BY u.username
    `;
    const usersResult = await pool.query(usersQuery, [roleId]);

    // Get menus accessible by this role
    const menusQuery = `
      SELECT 
        m.*,
        rm.can_create,
        rm.can_read,
        rm.can_update,
        rm.can_delete
      FROM menus m
      INNER JOIN role_menus rm ON m.id = rm.menu_id
      WHERE rm.role_id = $1
      ORDER BY m.parent_id NULLS FIRST, m.menu_order
    `;
    const menusResult = await pool.query(menusQuery, [roleId]);

    return {
      ...role,
      users: usersResult.rows,
      menus: menusResult.rows,
      user_count: usersResult.rows.length,
      menu_count: menusResult.rows.length
    };
  }

  // Create new role
  static async create(roleData) {
    const { 
      name, 
      description,
      can_create = false,
      can_read = true,
      can_update = false,
      can_delete = false
    } = roleData;
    
    const query = `
      INSERT INTO roles (name, description, can_create, can_read, can_update, can_delete)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [
      name, 
      description, 
      can_create, 
      can_read, 
      can_update, 
      can_delete
    ]);
    return result.rows[0];
  }

  // Update role
  static async update(id, roleData) {
    const { name, description, can_create, can_read, can_update, can_delete } = roleData;
    
    const query = `
      UPDATE roles
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          can_create = COALESCE($3, can_create),
          can_read = COALESCE($4, can_read),
          can_update = COALESCE($5, can_update),
          can_delete = COALESCE($6, can_delete)
      WHERE id = $7
      RETURNING *
    `;
    const result = await pool.query(query, [
      name, 
      description, 
      can_create, 
      can_read, 
      can_update, 
      can_delete, 
      id
    ]);
    return result.rows[0];
  }

  // Delete role
  static async delete(id) {
    // Check if role has users
    const checkQuery = `
      SELECT COUNT(*) as user_count 
      FROM user_roles 
      WHERE role_id = $1
    `;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (parseInt(checkResult.rows[0].user_count) > 0) {
      throw new Error('Tidak dapat menghapus role yang masih memiliki user');
    }

    const query = 'DELETE FROM roles WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Assign user to role
  static async assignUser(roleId, userId, permissions = {}) {
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

  // Remove user from role
  static async removeUser(roleId, userId) {
    const query = `
      DELETE FROM user_roles 
      WHERE user_id = $1 AND role_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [userId, roleId]);
    return result.rows[0];
  }

  // Get all users with this role
  static async getUsers(roleId) {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.full_name, 
        u.is_active,
        ur.created_at as assigned_at
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.role_id = $1
      ORDER BY u.username
    `;
    const result = await pool.query(query, [roleId]);
    return result.rows;
  }

  // Assign menu to role
  static async assignMenu(roleId, menuId, permissions = {}) {
    const { 
      can_create = false, 
      can_read = true, 
      can_update = false, 
      can_delete = false 
    } = permissions;

    const query = `
      INSERT INTO role_menus (role_id, menu_id, can_create, can_read, can_update, can_delete)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (role_id, menu_id) 
      DO UPDATE SET 
        can_create = $3, 
        can_read = $4, 
        can_update = $5, 
        can_delete = $6,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await pool.query(query, [
      roleId, menuId, can_create, can_read, can_update, can_delete
    ]);
    return result.rows[0];
  }

  // Remove menu from role
  static async removeMenu(roleId, menuId) {
    const query = `
      DELETE FROM role_menus 
      WHERE role_id = $1 AND menu_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [roleId, menuId]);
    return result.rows[0];
  }

  // Get all menus accessible by this role
  static async getMenus(roleId) {
    const query = `
      SELECT 
        m.*,
        rm.can_create,
        rm.can_read,
        rm.can_update,
        rm.can_delete
      FROM menus m
      INNER JOIN role_menus rm ON m.id = rm.menu_id
      WHERE rm.role_id = $1 AND m.is_active = true
      ORDER BY m.parent_id NULLS FIRST, m.menu_order
    `;
    const result = await pool.query(query, [roleId]);
    return result.rows;
  }

  // Check if role exists
  static async exists(id) {
    const query = 'SELECT EXISTS(SELECT 1 FROM roles WHERE id = $1)';
    const result = await pool.query(query, [id]);
    return result.rows[0].exists;
  }

  // Bulk assign users to role
  static async bulkAssignUsers(roleId, userIds) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const results = [];
      for (const userId of userIds) {
        const result = await client.query(`
          INSERT INTO user_roles (user_id, role_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id, role_id) DO NOTHING
          RETURNING *
        `, [userId, roleId]);
        if (result.rows[0]) {
          results.push(result.rows[0]);
        }
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Bulk remove users from role
  static async bulkRemoveUsers(roleId, userIds) {
    const query = `
      DELETE FROM user_roles 
      WHERE role_id = $1 AND user_id = ANY($2::int[])
      RETURNING *
    `;
    const result = await pool.query(query, [roleId, userIds]);
    return result.rows;
  }

  // Clone role (copy all menus permissions to new role)
  static async clone(sourceRoleId, newRoleName, newRoleDescription) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create new role
      const createRoleResult = await client.query(`
        INSERT INTO roles (name, description)
        VALUES ($1, $2)
        RETURNING *
      `, [newRoleName, newRoleDescription]);
      
      const newRole = createRoleResult.rows[0];
      
      // Copy menu permissions
      await client.query(`
        INSERT INTO role_menus (role_id, menu_id, can_create, can_read, can_update, can_delete)
        SELECT $1, menu_id, can_create, can_read, can_update, can_delete
        FROM role_menus
        WHERE role_id = $2
      `, [newRole.id, sourceRoleId]);
      
      await client.query('COMMIT');
      return newRole;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get role statistics
  static async getStatistics(roleId) {
    const query = `
      SELECT 
        r.id,
        r.name,
        r.description,
        COUNT(DISTINCT ur.user_id) as total_users,
        COUNT(DISTINCT rm.menu_id) as total_menus,
        COUNT(DISTINCT CASE WHEN rm.can_create = true THEN rm.menu_id END) as menus_with_create,
        COUNT(DISTINCT CASE WHEN rm.can_update = true THEN rm.menu_id END) as menus_with_update,
        COUNT(DISTINCT CASE WHEN rm.can_delete = true THEN rm.menu_id END) as menus_with_delete
      FROM roles r
      LEFT JOIN user_roles ur ON r.id = ur.role_id
      LEFT JOIN role_menus rm ON r.id = rm.role_id
      WHERE r.id = $1
      GROUP BY r.id, r.name, r.description
    `;
    const result = await pool.query(query, [roleId]);
    return result.rows[0];
  }
}

module.exports = Role;
