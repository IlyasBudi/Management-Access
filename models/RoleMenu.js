// models/RoleMenu.js
const pool = require('../config/database');

class RoleMenu {
  // Grant menu access to role
  static async grantAccess(accessData) {
    const { 
      role_id, 
      menu_id, 
      can_create = false, 
      can_read = true, 
      can_update = false, 
      can_delete = false 
    } = accessData;
    
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
      role_id, menu_id, can_create, can_read, can_update, can_delete
    ]);
    return result.rows[0];
  }

  // Revoke menu access from role
  static async revokeAccess(roleId, menuId) {
    const query = `
      DELETE FROM role_menus 
      WHERE role_id = $1 AND menu_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [roleId, menuId]);
    return result.rows[0];
  }

  // Get all menu access for a specific role
  static async getByRoleId(roleId) {
    const query = `
      SELECT 
        rm.*,
        m.menu_name,
        m.menu_code,
        m.parent_id,
        m.menu_order
      FROM role_menus rm
      INNER JOIN menus m ON rm.menu_id = m.id
      WHERE rm.role_id = $1
      ORDER BY m.parent_id NULLS FIRST, m.menu_order
    `;
    const result = await pool.query(query, [roleId]);
    return result.rows;
  }

  // Get all roles that have access to a specific menu
  static async getByMenuId(menuId) {
    const query = `
      SELECT 
        rm.*,
        r.name as role_name,
        r.description
      FROM role_menus rm
      INNER JOIN roles r ON rm.role_id = r.id
      WHERE rm.menu_id = $1
    `;
    const result = await pool.query(query, [menuId]);
    return result.rows;
  }

  // Check if role has access to menu
  static async hasAccess(roleId, menuId, permission = 'can_read') {
    const query = `
      SELECT * FROM role_menus 
      WHERE role_id = $1 AND menu_id = $2 AND ${permission} = true
    `;
    const result = await pool.query(query, [roleId, menuId]);
    return result.rows.length > 0;
  }

  // Bulk grant access (multiple menus to one role)
  static async bulkGrant(roleId, menuAccessList) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const results = [];
      for (const access of menuAccessList) {
        const result = await client.query(`
          INSERT INTO role_menus (role_id, menu_id, can_create, can_read, can_update, can_delete)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (role_id, menu_id) 
          DO UPDATE SET 
            can_create = $3, 
            can_read = $4, 
            can_update = $5, 
            can_delete = $6
          RETURNING *
        `, [
          roleId,
          access.menu_id,
          access.can_create || false,
          access.can_read !== undefined ? access.can_read : true,
          access.can_update || false,
          access.can_delete || false
        ]);
        results.push(result.rows[0]);
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

  // Bulk revoke access (remove all menus from role)
  static async bulkRevoke(roleId, menuIds) {
    const query = `
      DELETE FROM role_menus 
      WHERE role_id = $1 AND menu_id = ANY($2::int[])
      RETURNING *
    `;
    const result = await pool.query(query, [roleId, menuIds]);
    return result.rows;
  }

  // Get all menu accesses
  static async findAll() {
    const query = `
      SELECT 
        rm.*,
        r.name as role_name,
        m.menu_name,
        m.menu_code
      FROM role_menus rm
      INNER JOIN roles r ON rm.role_id = r.id
      INNER JOIN menus m ON rm.menu_id = m.id
      ORDER BY r.name, m.menu_order
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = RoleMenu;
