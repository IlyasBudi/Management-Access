const pool = require('../config/database');

const migrations = [
  {
    name: '001_create_users_table',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_users_username ON users(username);
    `,
    down: `
      DROP TABLE IF EXISTS users;
    `
  },
  {
    name: '002_create_roles_table',
    up: `
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    down: `
      DROP TABLE IF EXISTS roles;
    `
  },
  {
    name: '002_create_user_roles_table',
    up: `
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, role_id)
      );
      CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
      CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
    `,
    down: `
      DROP TABLE IF EXISTS user_roles;
    `
  },
  {
    name: '003_create_menus_table',
    up: `
       CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        menu_name VARCHAR(100) NOT NULL,
        menu_code VARCHAR(50) UNIQUE NOT NULL,
        parent_id INTEGER REFERENCES menus(id) ON DELETE CASCADE,
        menu_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       );

       CREATE INDEX idx_menus_parent_id ON menus(parent_id);
       CREATE INDEX idx_menus_menu_code ON menus(menu_code);
    `,
    down: `
      DROP TABLE IF EXISTS menus;
    `
  },
  {
    name: '004_create_role_menus_table',
    up: `
       CREATE TABLE IF NOT EXISTS role_menus (
        id SERIAL PRIMARY KEY,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
        can_create BOOLEAN DEFAULT false,
        can_read BOOLEAN DEFAULT true,
        can_update BOOLEAN DEFAULT false,
        can_delete BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(role_id, menu_id)
       );
       CREATE INDEX idx_role_menus_role_id ON role_menus(role_id);
       CREATE INDEX idx_role_menus_menu_id ON role_menus(menu_id);
    `,
    down: `
      DROP TABLE IF EXISTS role_menus;
    `
  }
];

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    // Create migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('🚀 Starting migrations...\n');

    for (const migration of migrations) {
      // Check if migration already executed
      const result = await client.query(
        'SELECT * FROM migrations WHERE name = $1',
        [migration.name]
      );

      if (result.rows.length === 0) {
        console.log(`Running migration: ${migration.name}`);
        
        await client.query('BEGIN');
        await client.query(migration.up);
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migration.name]
        );
        await client.query('COMMIT');
        
        console.log(`✓ ${migration.name} completed\n`);
      } else {
        console.log(`⊘ ${migration.name} already executed\n`);
      }
    }

    console.log('✓ All migrations completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error);
