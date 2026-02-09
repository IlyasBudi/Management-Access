// models/Menu.js
const pool = require('../config/database');

class Menu {
  // Get all menus (flat)
  static async findAll() {
    const query = `
      SELECT * FROM menus 
      WHERE is_active = true
      ORDER BY parent_id NULLS FIRST, menu_order
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get hierarchical menu structure
  static async getHierarchical() {
    const menus = await this.findAll();
    return this.buildTree(menus);
  }

  // Build tree structure from flat array
  static buildTree(items, parentId = null) {
    const tree = [];
    
    items.forEach(item => {
      if (item.parent_id === parentId) {
        const children = this.buildTree(items, item.id);
        const node = { ...item };
        if (children.length > 0) {
          node.children = children;
        }
        tree.push(node);
      }
    });
    
    return tree.sort((a, b) => a.menu_order - b.menu_order);
  }

  // Get menus by role ID (menu sesuai role yang dipilih)
  static async getByRoleId(roleId) {
    const query = `
      WITH RECURSIVE menu_tree AS (
        -- Get all parent menus accessible by role
        SELECT DISTINCT
          m.id, 
          m.menu_name, 
          m.menu_code, 
          m.parent_id, 
          m.menu_order,
          m.is_active,
          rm.can_create,
          rm.can_read,
          rm.can_update,
          rm.can_delete,
          0 as level
        FROM menus m
        INNER JOIN role_menus rm ON m.id = rm.menu_id
        WHERE rm.role_id = $1 
          AND m.is_active = true 
          AND m.parent_id IS NULL
          AND rm.can_read = true
        
        UNION ALL
        
        -- Get all child menus recursively
        SELECT DISTINCT
          m.id,
          m.menu_name,
          m.menu_code,
          m.parent_id,
          m.menu_order,
          m.is_active,
          COALESCE(rm.can_create, false) as can_create,
          COALESCE(rm.can_read, true) as can_read,
          COALESCE(rm.can_update, false) as can_update,
          COALESCE(rm.can_delete, false) as can_delete,
          mt.level + 1
        FROM menus m
        INNER JOIN menu_tree mt ON m.parent_id = mt.id
        LEFT JOIN role_menus rm ON m.id = rm.menu_id AND rm.role_id = $1
        WHERE m.is_active = true
      )
      SELECT * FROM menu_tree
      ORDER BY parent_id NULLS FIRST, menu_order
    `;
    
    const result = await pool.query(query, [roleId]);
    return this.buildTree(result.rows);
  }

  // Find menu by ID
  static async findById(id) {
    const query = 'SELECT * FROM menus WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find menu by code
  static async findByCode(menuCode) {
    const query = 'SELECT * FROM menus WHERE menu_code = $1';
    const result = await pool.query(query, [menuCode]);
    return result.rows[0];
  }

  // Create new menu
  static async create(menuData) {
    const { menu_name, menu_code, parent_id, menu_order } = menuData;
    
    const query = `
      INSERT INTO menus (menu_name, menu_code, parent_id, menu_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [
      menu_name, 
      menu_code, 
      parent_id || null, 
      menu_order || 0
    ]);
    return result.rows[0];
  }

  // Update menu
  static async update(id, menuData) {
    const { menu_name, menu_code, parent_id, menu_order, is_active } = menuData;
    
    const query = `
      UPDATE menus
      SET menu_name = COALESCE($1, menu_name),
          menu_code = COALESCE($2, menu_code),
          parent_id = $3,
          menu_order = COALESCE($4, menu_order),
          is_active = COALESCE($5, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    const result = await pool.query(query, [
      menu_name, 
      menu_code, 
      parent_id, 
      menu_order, 
      is_active, 
      id
    ]);
    return result.rows[0];
  }

  // Delete menu
  static async delete(id) {
    const query = 'DELETE FROM menus WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get children of a menu
  static async getChildren(parentId) {
    const query = `
      SELECT * FROM menus 
      WHERE parent_id = $1 AND is_active = true
      ORDER BY menu_order
    `;
    const result = await pool.query(query, [parentId]);
    return result.rows;
  }
}

module.exports = Menu;
