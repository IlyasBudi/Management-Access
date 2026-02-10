// seeders/index.js
const pool = require('../config/database');
const User = require('../models/User');
const Role = require('../models/Role');
const Menu = require('../models/Menu');

class DatabaseSeeder {
  static async run() {
    const client = await pool.connect();
    
    try {
      console.log('Starting database seeding...\n');

      // Check if already seeded
      const checkUsers = await client.query('SELECT COUNT(*) FROM users');
      if (parseInt(checkUsers.rows[0].count) > 0) {
        console.log('Database already contains data. Skipping seed...\n');
        console.log('Run: npm run db:reset to reset and reseed database\n');
        return;
      }

      await client.query('BEGIN');

      // 1. Seed Roles
      console.log('Seeding roles...');
      const roles = await this.seedRoles();
      console.log(`✓ Created ${roles.length} roles\n`);

      // 2. Seed Users
      console.log('Seeding users...');
      const users = await this.seedUsers();
      console.log(`✓ Created ${users.length} users\n`);

      // 3. Assign Roles to Users
      console.log('Assigning roles to users...');
      await this.assignUserRoles(users, roles);
      console.log('✓ User roles assigned\n');

      // 4. Seed Menus (Hierarchical sesuai screenshot)
      console.log('Seeding hierarchical menus...');
      const menus = await this.seedMenus();
      console.log(`✓ Created ${menus.length} menus\n`);

      // 5. Assign Menu Permissions to Roles
      console.log('Assigning menu permissions to roles...');
      await this.assignRoleMenuPermissions(roles, menus);
      console.log('✓ Role menu permissions assigned\n');

      await client.query('COMMIT');

      // Display summary
      await this.displaySummary();

      console.log('\nDatabase seeding completed successfully!\n');

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Seeding failed:', error.message);
      console.error(error);
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  }

  // Seed Roles (Hanya 3: Super Admin, Manager, Staff)
  static async seedRoles() {
    const rolesData = [
      { 
        name: 'Super Admin', 
        description: 'Super administrator dengan akses penuh',
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true
      },
      { 
        name: 'Manager', 
        description: 'Manager dengan akses management',
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: false
      },
      { 
        name: 'Staff', 
        description: 'Staff dengan akses terbatas',
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false
      }
    ];

    const roles = [];
    for (const roleData of rolesData) {
      const role = await Role.create(roleData);
      roles.push(role);
    }

    return roles;
  }

  // Seed Users (5 users: superadmin, karyawan1-4)
  static async seedUsers() {
    const usersData = [
      { username: 'superadmin', password: 'superadmin123', full_name: 'Super Administrator' },
      { username: 'karyawan1', password: 'karyawan123', full_name: 'Karyawan Satu' },
      { username: 'karyawan2', password: 'karyawan123', full_name: 'Karyawan Dua' },
      { username: 'karyawan3', password: 'karyawan123', full_name: 'Karyawan Tiga' },
      { username: 'karyawan4', password: 'karyawan123', full_name: 'Karyawan Empat' }
    ];

    const users = [];
    for (const userData of usersData) {
      const user = await User.create(userData);
      users.push(user);
    }

    return users;
  }

  // Assign Roles to Users (dengan multiple roles untuk demo)
  static async assignUserRoles(users, roles) {
    const [superAdmin, manager, staff] = roles;

    // superadmin -> Super Admin role (Full CRUD)
    await User.assignRole(users[0].id, superAdmin.id, {
      can_create: true,
      can_read: true,
      can_update: true,
      can_delete: true
    });

    // karyawan1 -> Manager (CRU) + Staff (Read only)
    await User.assignRole(users[1].id, manager.id, {
      can_create: true,
      can_read: true,
      can_update: true,
      can_delete: false
    });
    await User.assignRole(users[1].id, staff.id, {
      can_create: false,
      can_read: true,
      can_update: false,
      can_delete: false
    });

    // karyawan2 -> Manager only (CRU)
    await User.assignRole(users[2].id, manager.id, {
      can_create: true,
      can_read: true,
      can_update: true,
      can_delete: false
    });

    // karyawan3 -> Staff only (Read only)
    await User.assignRole(users[3].id, staff.id, {
      can_create: false,
      can_read: true,
      can_update: false,
      can_delete: false
    });

    // karyawan4 -> Manager (CRU) + Staff (Read only)
    await User.assignRole(users[4].id, manager.id, {
      can_create: true,
      can_read: true,
      can_update: true,
      can_delete: false
    });
    await User.assignRole(users[4].id, staff.id, {
      can_create: false,
      can_read: true,
      can_update: false,
      can_delete: false
    });
  }

  // Seed Menus
  static async seedMenus() {
    const menus = [];

    // ==== Level 1: Root Menus ====
    const menu1 = await Menu.create({
      menu_name: 'Menu 1',
      menu_code: 'MENU_1',
      parent_id: null,
      menu_order: 1
    });
    menus.push(menu1);

    const menu2 = await Menu.create({
      menu_name: 'Menu 2',
      menu_code: 'MENU_2',
      parent_id: null,
      menu_order: 2
    });
    menus.push(menu2);

    const menu3 = await Menu.create({
      menu_name: 'Menu 3',
      menu_code: 'MENU_3',
      parent_id: null,
      menu_order: 3
    });
    menus.push(menu3);

    // ==== Level 2: Menu 1 Children ====
    const menu1_1 = await Menu.create({
      menu_name: 'Menu 1.1',
      menu_code: 'MENU_1_1',
      parent_id: menu1.id,
      menu_order: 1
    });
    menus.push(menu1_1);

    const menu1_2 = await Menu.create({
      menu_name: 'Menu 1.2',
      menu_code: 'MENU_1_2',
      parent_id: menu1.id,
      menu_order: 2
    });
    menus.push(menu1_2);

    const menu1_3 = await Menu.create({
      menu_name: 'Menu 1.3',
      menu_code: 'MENU_1_3',
      parent_id: menu1.id,
      menu_order: 3
    });
    menus.push(menu1_3);

    // ==== Level 3: Menu 1.2 Children ====
    const menu1_2_1 = await Menu.create({
      menu_name: 'Menu 1.2.1',
      menu_code: 'MENU_1_2_1',
      parent_id: menu1_2.id,
      menu_order: 1
    });
    menus.push(menu1_2_1);

    const menu1_2_2 = await Menu.create({
      menu_name: 'Menu 1.2.2',
      menu_code: 'MENU_1_2_2',
      parent_id: menu1_2.id,
      menu_order: 2
    });
    menus.push(menu1_2_2);

    // ==== Level 3: Menu 1.3 Children ====
    const menu1_3_1 = await Menu.create({
      menu_name: 'Menu 1.3.1',
      menu_code: 'MENU_1_3_1',
      parent_id: menu1_3.id,
      menu_order: 1
    });
    menus.push(menu1_3_1);

    // ==== Level 2: Menu 2 Children ====
    const menu2_1 = await Menu.create({
      menu_name: 'Menu 2.1',
      menu_code: 'MENU_2_1',
      parent_id: menu2.id,
      menu_order: 1
    });
    menus.push(menu2_1);

    const menu2_2 = await Menu.create({
      menu_name: 'Menu 2.2',
      menu_code: 'MENU_2_2',
      parent_id: menu2.id,
      menu_order: 2
    });
    menus.push(menu2_2);

    const menu2_3 = await Menu.create({
      menu_name: 'Menu 2.3',
      menu_code: 'MENU_2_3',
      parent_id: menu2.id,
      menu_order: 3
    });
    menus.push(menu2_3);

    // ==== Level 3: Menu 2.2 Children ====
    const menu2_2_1 = await Menu.create({
      menu_name: 'Menu 2.2.1',
      menu_code: 'MENU_2_2_1',
      parent_id: menu2_2.id,
      menu_order: 1
    });
    menus.push(menu2_2_1);

    const menu2_2_2 = await Menu.create({
      menu_name: 'Menu 2.2.2',
      menu_code: 'MENU_2_2_2',
      parent_id: menu2_2.id,
      menu_order: 2
    });
    menus.push(menu2_2_2);

    const menu2_2_3 = await Menu.create({
      menu_name: 'Menu 2.2.3',
      menu_code: 'MENU_2_2_3',
      parent_id: menu2_2.id,
      menu_order: 3
    });
    menus.push(menu2_2_3);

    // ==== Level 4: Menu 2.2.2 Children ====
    const menu2_2_2_1 = await Menu.create({
      menu_name: 'Menu 2.2.2.1',
      menu_code: 'MENU_2_2_2_1',
      parent_id: menu2_2_2.id,
      menu_order: 1
    });
    menus.push(menu2_2_2_1);

    const menu2_2_2_2 = await Menu.create({
      menu_name: 'Menu 2.2.2.2',
      menu_code: 'MENU_2_2_2_2',
      parent_id: menu2_2_2.id,
      menu_order: 2
    });
    menus.push(menu2_2_2_2);

    // ==== Level 2: Menu 3 Children ====
    const menu3_1 = await Menu.create({
      menu_name: 'Menu 3.1',
      menu_code: 'MENU_3_1',
      parent_id: menu3.id,
      menu_order: 1
    });
    menus.push(menu3_1);

    const menu3_2 = await Menu.create({
      menu_name: 'Menu 3.2',
      menu_code: 'MENU_3_2',
      parent_id: menu3.id,
      menu_order: 2
    });
    menus.push(menu3_2);

    return menus;
  }

  // Assign Menu Permissions to Roles
  static async assignRoleMenuPermissions(roles, menus) {
    const [superAdmin, manager, staff] = roles;

    // Super Admin - Full Access (CRUD) to ALL menus
    for (const menu of menus) {
      await Role.assignMenu(superAdmin.id, menu.id, {
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true
      });
    }

    // Manager - Full access to Menu 1 and Menu 2 (CRU, no Delete)
    const menu1Menus = menus.filter(m => m.menu_code.startsWith('MENU_1'));
    const menu2Menus = menus.filter(m => m.menu_code.startsWith('MENU_2'));

    for (const menu of [...menu1Menus, ...menu2Menus]) {
      await Role.assignMenu(manager.id, menu.id, {
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: false
      });
    }

    // Staff - Read only access to Menu 3
    const menu3Menus = menus.filter(m => m.menu_code.startsWith('MENU_3'));

    for (const menu of menu3Menus) {
      await Role.assignMenu(staff.id, menu.id, {
        can_create: false,
        can_read: true,
        can_update: false,
        can_delete: false
      });
    }
  }

  // Display Summary
  static async displaySummary() {
    const client = await pool.connect();
    try {
      const stats = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as users_count,
          (SELECT COUNT(*) FROM roles) as roles_count,
          (SELECT COUNT(*) FROM menus) as menus_count,
          (SELECT COUNT(*) FROM user_roles) as user_roles_count,
          (SELECT COUNT(*) FROM role_menus) as role_menus_count
      `);

      console.log('\nSeeding Summary:');
      console.log('══════════════════════════════════════');
      console.log(`Users Created: ${stats.rows[0].users_count}`);
      console.log(`Roles Created: ${stats.rows[0].roles_count}`);
      console.log(`Menus Created: ${stats.rows[0].menus_count}`);
      console.log(`User-Role Assignments: ${stats.rows[0].user_roles_count}`);
      console.log(`Role-Menu Permissions: ${stats.rows[0].role_menus_count}`);
      console.log('══════════════════════════════════════');

      console.log('\nLogin Credentials:');
      console.log('══════════════════════════════════════');
      console.log('1. Super Admin:');
      console.log('   Username: superadmin');
      console.log('   Password: superadmin123');
      console.log('   Role: Super Admin (CRUD)');
      console.log('   User Permission: Full CRUD');
      console.log('   Role Permission: Full CRUD');
      console.log('   Menu Access: Full CRUD ke semua menu');
      
      console.log('\n2. Karyawan 1 (Jabatan Ganda):');
      console.log('   Username: karyawan1');
      console.log('   Password: karyawan123');
      console.log('   Roles:');
      console.log('     - Manager (CRU permission)');
      console.log('     - Staff (Read-only permission)');
      console.log('   Access: Depends on selected role');
      
      console.log('\n3. Karyawan 2:');
      console.log('   Username: karyawan2');
      console.log('   Password: karyawan123');
      console.log('   Role: Manager (CRU permission)');
      console.log('   User Permission: CRU');
      console.log('   Role Permission: CRU');
      console.log('   Menu Access: CRU ke Menu 1 & 2');
      
      console.log('\n4. Karyawan 3:');
      console.log('   Username: karyawan3');
      console.log('   Password: karyawan123');
      console.log('   Role: Staff (Read-only permission)');
      console.log('   User Permission: Read only');
      console.log('   Role Permission: Read only');
      console.log('   Menu Access: Read only ke Menu 3');
      
      console.log('\n5. Karyawan 4 (Jabatan Ganda):');
      console.log('   Username: karyawan4');
      console.log('   Password: karyawan123');
      console.log('   Roles:');
      console.log('     - Manager (CRU permission)');
      console.log('     - Staff (Read-only permission)');
      console.log('   Access: Depends on selected role');
      
      console.log('══════════════════════════════════════\n');
    } finally {
      client.release();
    }
  }
}

// Run seeder
DatabaseSeeder.run().catch(console.error);
