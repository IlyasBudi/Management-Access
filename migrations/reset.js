// migrations/reset.js
const pool = require('../config/database');

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Force dropping all tables...\n');
    
    await client.query('BEGIN');
    
    // Drop semua table dengan CASCADE
    await client.query(`
      DROP TABLE IF EXISTS role_menus CASCADE;
      DROP TABLE IF EXISTS user_roles CASCADE;
      DROP TABLE IF EXISTS menus CASCADE;
      DROP TABLE IF EXISTS roles CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS migrations CASCADE;
    `);
    
    await client.query('COMMIT');
    
    console.log('✓ All tables dropped successfully!\n');
    console.log('Now run: npm run migrate\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reset failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase().catch(console.error);
