const pool = require('../config/database');

const migrations = [
    {
        name: '004_create_role_menus_table',
        down: `
        DROP TABLE IF EXISTS role_menus CASCADE;
        `
    },
    {
        name: '003_create_menus_table',
        down: `
        DROP TABLE IF EXISTS menus CASCADE;
        `
    },
    {
        name: '002_create_user_roles_table',
        down: `
        DROP TABLE IF EXISTS user_roles CASCADE;
        `
    },
    {
        name: '002_create_roles_table',
        down: `
        DROP TABLE IF EXISTS roles CASCADE;
        `
    },
    {
        name: '001_create_users_table',
        down: `
        DROP TABLE IF EXISTS users CASCADE;
        `
    }
];

async function rollbackMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Starting rollback...\n');

    for (const migration of migrations) {
      // Check if migration exists
      const result = await client.query(
        'SELECT * FROM migrations WHERE name = $1',
        [migration.name]
      );

      if (result.rows.length > 0) {
        console.log(`Rolling back: ${migration.name}`);
        
        await client.query('BEGIN');
        await client.query(migration.down);
        await client.query(
          'DELETE FROM migrations WHERE name = $1',
          [migration.name]
        );
        await client.query('COMMIT');
        
        console.log(`✓ ${migration.name} rolled back\n`);
      } else {
        console.log(`⊘ ${migration.name} not found\n`);
      }
    }

    console.log('✓ Rollback completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Rollback failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

rollbackMigrations().catch(console.error);
