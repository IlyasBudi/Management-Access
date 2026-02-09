# API Documentation - Management Access System

## Informasi Umum

**Base URL:** `http://localhost:3000/api`  
**Authentication:** Bearer Token (JWT)

---

## Daftar Isi

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Role Management](#role-management)
4. [Menu Management](#menu-management)

---

## Authentication

### 1. Login

Endpoint untuk login user. Jika user memiliki multiple roles, akan diminta untuk memilih role terlebih dahulu.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "username": "karyawan1",
  "password": "karyawan123"
}
```

**Response (Single Role):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "2",
      "username": "karyawan1",
      "full_name": "Karyawan Satu"
    },
    "role": {
      "role_id": "2",
      "role_name": "Manager"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "menus": [
      {
        "id": "1",
        "menu_name": "Dashboard",
        "menu_code": "MENU_1",
        "parent_id": null,
        "menu_order": 1,
        "can_create": true,
        "can_update": true,
        "can_delete": true
      }
    ]
  }
}
```

**Response (Multiple Roles - Perlu Pilih Role):**
```json
{
  "success": true,
  "message": "Silakan pilih role",
  "data": {
    "user": {
      "id": "2",
      "username": "karyawan1",
      "full_name": "Karyawan Satu"
    },
    "roles": [
      {
        "role_id": "2",
        "role_name": "Manager"
      },
      {
        "role_id": "3",
        "role_name": "Staff"
      }
    ],
    "requireRoleSelection": true
  }
}
```

---

### 2. Select Role

Endpoint untuk memilih role (digunakan ketika user memiliki multiple roles).

**Endpoint:** `POST /auth/select-role`

**Request Body:**
```json
{
  "user_id": "2",
  "role_id": "2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role berhasil dipilih",
  "data": {
    "user": {
      "id": "2",
      "username": "karyawan1",
      "full_name": "Karyawan Satu"
    },
    "role": {
      "role_id": "2",
      "role_name": "Manager"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "menus": [
      {
        "id": "1",
        "menu_name": "Dashboard",
        "menu_code": "MENU_1",
        "parent_id": null,
        "menu_order": 1,
        "can_create": true,
        "can_update": true,
        "can_delete": true
      }
    ]
  }
}
```

---

### 3. Get Profile

Endpoint untuk mendapatkan informasi user yang sedang login.

**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "2",
      "username": "karyawan1",
      "full_name": "Karyawan Satu"
    },
    "current_role": "Manager",
    "available_roles": [
      {
        "role_id": "2",
        "role_name": "Manager"
      },
      {
        "role_id": "3",
        "role_name": "Staff"
      }
    ],
    "menus": [
      {
        "id": "1",
        "menu_name": "Dashboard",
        "menu_code": "MENU_1",
        "parent_id": null,
        "menu_order": 1,
        "can_create": true,
        "can_update": true,
        "can_delete": true
      }
    ]
  }
}
```

---

### 4. Refresh Token

Endpoint untuk refresh JWT token.

**Endpoint:** `POST /auth/refresh-token`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "user_id": "2",
  "role_id": "2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token berhasil di-refresh",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 5. Logout

Endpoint untuk logout. Token akan dihapus di client side.

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "user_id": "2",
  "role_id": "2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

---

## User Management

### 1. Get All Users

Mendapatkan semua data users.

**Endpoint:** `GET /users/`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "1",
      "username": "admin",
      "full_name": "Administrator",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "2",
      "username": "karyawan1",
      "full_name": "Karyawan Satu",
      "is_active": true,
      "created_at": "2025-01-02T00:00:00.000Z",
      "updated_at": "2025-01-02T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Get User by ID

Mendapatkan detail user berdasarkan ID.

**Endpoint:** `GET /users/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "7",
    "username": "tes",
    "full_name": "testestes",
    "is_active": true,
    "created_at": "2025-01-15T00:00:00.000Z",
    "updated_at": "2025-01-15T00:00:00.000Z",
    "roles": [
      {
        "role_id": "3",
        "role_name": "Staff"
      }
    ]
  }
}
```

---

### 3. Get User Roles

Mendapatkan semua roles yang dimiliki user.

**Endpoint:** `GET /users/:id/roles`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "User roles retrieved successfully",
  "data": [
    {
      "role_id": "2",
      "role_name": "Manager",
      "description": "Manager role"
    },
    {
      "role_id": "3",
      "role_name": "Staff",
      "description": "Staff role"
    }
  ]
}
```

---

### 4. Create User

Membuat user baru.

**Endpoint:** `POST /users/`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "tes",
  "full_name": "testestes",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "7",
    "username": "tes",
    "full_name": "testestes",
    "is_active": true,
    "created_at": "2025-01-15T00:00:00.000Z"
  }
}
```

---

### 5. Update User

Update data user (username, full_name, is_active).

**Endpoint:** `PUT /users/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "tes",
  "full_name": "testestes1",
  "is_active": "false"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "7",
    "username": "tes",
    "full_name": "testestes1",
    "is_active": false,
    "updated_at": "2025-01-16T00:00:00.000Z"
  }
}
```

---

### 6. Update Password

Update password user.

**Endpoint:** `PUT /users/:id/password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "new_password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

### 7. Assign Role to User

Assign role ke user.

**Endpoint:** `POST /users/:id/roles`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role_id": "3"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role assigned to user successfully"
}
```

---

### 8. Remove Role from User

Hapus role dari user.

**Endpoint:** `DELETE /users/:userId/roles/:roleId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Role removed from user successfully"
}
```

---

### 9. Delete User

Hapus user.

**Endpoint:** `DELETE /users/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Role Management

### 1. Get All Roles

Mendapatkan semua roles.

**Endpoint:** `GET /roles/`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Roles retrieved successfully",
  "data": [
    {
      "id": "1",
      "name": "Admin",
      "description": "Administrator role",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "2",
      "name": "Manager",
      "description": "Manager role",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Role by ID

Mendapatkan detail role berdasarkan ID.

**Endpoint:** `GET /roles/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Role retrieved successfully",
  "data": {
    "id": "2",
    "name": "Manager",
    "description": "Manager role",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### 3. Get Role Details

Mendapatkan detail role lengkap dengan users dan menus.

**Endpoint:** `GET /roles/:id/details`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Role details retrieved successfully",
  "data": {
    "id": "4",
    "name": "tes",
    "description": "testestes",
    "users": [
      {
        "user_id": "7",
        "username": "tes",
        "full_name": "testestes"
      }
    ],
    "menus": [
      {
        "menu_id": "1",
        "menu_name": "Dashboard",
        "menu_code": "MENU_1",
        "can_create": true,
        "can_update": true,
        "can_delete": true
      }
    ]
  }
}
```

---

### 4. Get Role Users

Mendapatkan semua users yang memiliki role tertentu.

**Endpoint:** `GET /roles/:id/users`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Role users retrieved successfully",
  "data": [
    {
      "user_id": "2",
      "username": "karyawan1",
      "full_name": "Karyawan Satu",
      "is_active": true
    },
    {
      "user_id": "7",
      "username": "tes",
      "full_name": "testestes",
      "is_active": true
    }
  ]
}
```

---

### 5. Get Role Menus

Mendapatkan semua menus yang bisa diakses oleh role tertentu.

**Endpoint:** `GET /roles/:id/menus`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Role menus retrieved successfully",
  "data": [
    {
      "menu_id": "1",
      "menu_name": "Dashboard",
      "menu_code": "MENU_1",
      "parent_id": null,
      "menu_order": 1,
      "can_create": true,
      "can_update": true,
      "can_delete": true
    },
    {
      "menu_id": "2",
      "menu_name": "User Management",
      "menu_code": "MENU_2",
      "parent_id": null,
      "menu_order": 2,
      "can_create": true,
      "can_update": true,
      "can_delete": false
    }
  ]
}
```

---

### 6. Create Role

Membuat role baru.

**Endpoint:** `POST /roles/`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "tes",
  "description": "testestes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "id": "4",
    "name": "tes",
    "description": "testestes",
    "created_at": "2025-01-15T00:00:00.000Z"
  }
}
```

---

### 7. Update Role

Update data role.

**Endpoint:** `PUT /roles/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "tes",
  "description": "testestes updated"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "id": "4",
    "name": "tes",
    "description": "testestes updated",
    "updated_at": "2025-01-16T00:00:00.000Z"
  }
}
```

---

### 8. Assign User to Role

Assign user ke role.

**Endpoint:** `POST /roles/:id/users`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "user_id": "7"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User assigned to role successfully"
}
```

---

### 9. Bulk Assign Users to Role

Assign multiple users ke role sekaligus.

**Endpoint:** `POST /roles/:id/users/bulk-assign`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "user_ids": [7, 2]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Users assigned to role successfully",
  "data": {
    "assigned_count": 2
  }
}
```

---

### 10. Bulk Remove Users from Role

Remove multiple users dari role sekaligus.

**Endpoint:** `POST /roles/:id/users/bulk-remove`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "user_ids": [7, 2]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Users removed from role successfully",
  "data": {
    "removed_count": 2
  }
}
```

---

### 11. Assign Menu to Role

Assign menu ke role dengan permission (create, update, delete).

**Endpoint:** `POST /roles/:id/menus`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "menu_id": "1",
  "can_create": "true",
  "can_update": "true",
  "can_delete": "true"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu assigned to role successfully"
}
```

---

### 12. Remove User from Role

Remove user dari role.

**Endpoint:** `DELETE /roles/:roleId/users/:userId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "User removed from role successfully"
}
```

---

### 13. Remove Menu from Role

Remove menu dari role.

**Endpoint:** `DELETE /roles/:roleId/menus/:menuId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Menu removed from role successfully"
}
```

---

### 14. Delete Role

Hapus role.

**Endpoint:** `DELETE /roles/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

---

## Menu Management

### 1. Get All Menus (Flat)

Mendapatkan semua menus dalam bentuk flat/datar.

**Endpoint:** `GET /menus/`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Menus retrieved successfully",
  "data": [
    {
      "id": "1",
      "menu_name": "Dashboard",
      "menu_code": "MENU_1",
      "parent_id": null,
      "menu_order": 1,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "2",
      "menu_name": "User Management",
      "menu_code": "MENU_2",
      "parent_id": null,
      "menu_order": 2,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Hierarchical Menus

Mendapatkan menus dalam bentuk hierarki/tree structure.

**Endpoint:** `GET /menus/hierarchical`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Hierarchical menus retrieved successfully",
  "data": [
    {
      "id": "1",
      "menu_name": "Dashboard",
      "menu_code": "MENU_1",
      "parent_id": null,
      "menu_order": 1,
      "is_active": true,
      "children": []
    },
    {
      "id": "2",
      "menu_name": "User Management",
      "menu_code": "MENU_2",
      "parent_id": null,
      "menu_order": 2,
      "is_active": true,
      "children": [
        {
          "id": "3",
          "menu_name": "User List",
          "menu_code": "MENU_2_1",
          "parent_id": "2",
          "menu_order": 1,
          "is_active": true,
          "children": []
        }
      ]
    }
  ]
}
```

---

### 3. Get Menu by ID

Mendapatkan detail menu berdasarkan ID.

**Endpoint:** `GET /menus/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Menu retrieved successfully",
  "data": {
    "id": "1",
    "menu_name": "Dashboard",
    "menu_code": "MENU_1",
    "parent_id": null,
    "menu_order": 1,
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Get Menu by Code

Mendapatkan detail menu berdasarkan code.

**Endpoint:** `GET /menus/code/:code`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Menu retrieved successfully",
  "data": {
    "id": "1",
    "menu_name": "Dashboard",
    "menu_code": "MENU_1",
    "parent_id": null,
    "menu_order": 1,
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Get Menus by Role

Mendapatkan menu yang bisa diakses oleh role tertentu.

**Endpoint:** `GET /menus/role/:roleId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Menus by role retrieved successfully",
  "data": [
    {
      "id": "1",
      "menu_name": "Dashboard",
      "menu_code": "MENU_1",
      "parent_id": null,
      "menu_order": 1,
      "can_create": true,
      "can_update": true,
      "can_delete": true
    }
  ]
}
```

---

### 6. Get Menu Children

Mendapatkan children/submenu dari menu tertentu.

**Endpoint:** `GET /menus/:id/children`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Menu children retrieved successfully",
  "data": [
    {
      "id": "20",
      "menu_name": "Menu 2.2.2.2.1",
      "menu_code": "MENU_2_2_2_2.1",
      "parent_id": "17",
      "menu_order": 1,
      "is_active": true,
      "created_at": "2025-01-15T00:00:00.000Z",
      "updated_at": "2025-01-15T00:00:00.000Z"
    }
  ]
}
```

---

### 7. Create Menu

Membuat menu baru.

**Endpoint:** `POST /menus/`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "menu_name": "Menu 2.2.2.2.1",
  "menu_code": "MENU_2_2_2_2.1",
  "parent_id": "17",
  "menu_order": "1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu created successfully",
  "data": {
    "id": "20",
    "menu_name": "Menu 2.2.2.2.1",
    "menu_code": "MENU_2_2_2_2.1",
    "parent_id": "17",
    "menu_order": 1,
    "is_active": true,
    "created_at": "2025-01-15T00:00:00.000Z"
  }
}
```

---

### 8. Update Menu

Update data menu.

**Endpoint:** `PUT /menus/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "menu_name": "Menu 2.2.2.2.1",
  "menu_code": "MENU_2_2_2_2.1",
  "parent_id": "17",
  "menu_order": "1",
  "is_active": "false"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu updated successfully",
  "data": {
    "id": "20",
    "menu_name": "Menu 2.2.2.2.1",
    "menu_code": "MENU_2_2_2_2.1",
    "parent_id": "17",
    "menu_order": 1,
    "is_active": false,
    "updated_at": "2025-01-16T00:00:00.000Z"
  }
}
```

---

### 9. Delete Menu

Hapus menu.

**Endpoint:** `DELETE /menus/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Menu deleted successfully"
}
```

---

## Error Responses

Semua endpoint dapat mengembalikan error response dengan format berikut:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Username, password, and full_name are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Username already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details (development mode only)"
}
```

---

## Catatan Penting untuk Frontend

### 1. Authentication Flow
- Setelah login berhasil, simpan token JWT di localStorage atau sessionStorage
- Jika `requireRoleSelection: true`, tampilkan halaman untuk pilih role
- Setelah select role atau jika hanya 1 role, simpan token dan redirect ke dashboard
- Untuk setiap request selanjutnya, sertakan token di header: `Authorization: Bearer <token>`

### 2. Token Management
- Token memiliki expiry time (default 24 jam)
- Gunakan endpoint refresh token jika diperlukan
- Jika dapat response 401, redirect ke halaman login

### 3. Menu & Permissions
- Setelah login, akan mendapatkan array menus dengan permissions (can_create, can_update, can_delete)
- Gunakan data ini untuk:
  - Menampilkan/hide menu di sidebar
  - Enable/disable tombol Create, Edit, Delete di UI
  - Validasi akses sebelum melakukan action

### 4. Role Management
- User bisa memiliki multiple roles
- Jika user memiliki multiple roles, di halaman profile bisa switch role
- Setiap switch role, request token baru dengan endpoint select-role

### 5. Hierarchical Menu
- Gunakan endpoint `/menus/hierarchical` untuk mendapatkan menu tree structure
- Berguna untuk membuat sidebar menu dengan submenu

---

## Testing dengan Postman

Import file `Management Access.postman_collection.json` ke Postman untuk testing semua endpoint.

**Langkah Testing:**
1. Jalankan endpoint Login
2. Copy token dari response
3. Set token di Authorization Bearer untuk endpoint lainnya
4. Test semua endpoint sesuai kebutuhan

---

## Database Models

### User
- id
- username (unique)
- password (hashed)
- full_name
- is_active
- created_at
- updated_at

### Role
- id
- name (unique)
- description
- created_at
- updated_at

### Menu
- id
- menu_name
- menu_code (unique)
- parent_id
- menu_order
- is_active
- created_at
- updated_at

### UserRole (junction table)
- user_id
- role_id

### RoleMenu (junction table)
- role_id
- menu_id
- can_create
- can_update
- can_delete
