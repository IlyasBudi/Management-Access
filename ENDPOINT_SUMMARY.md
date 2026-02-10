# Endpoint Summary - Management Access API

## Quick Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/select-role` | Select role (multi-role user) | ❌ |
| GET | `/api/auth/profile` | Get current user profile | ✅ |
| POST | `/api/auth/refresh-token` | Refresh JWT token | ✅ |
| POST | `/api/auth/logout` | Logout user | ✅ |

---

### User Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/` | Get all users | ✅ |
| GET | `/api/users/:id` | Get user by ID | ✅ |
| GET | `/api/users/:id/roles` | Get user roles | ✅ |
| POST | `/api/users/` | Create new user | ✅ |
| PUT | `/api/users/:id` | Update user | ✅ |
| PUT | `/api/users/:id/password` | Update user password | ✅ |
| POST | `/api/users/:id/roles` | Assign role to user | ✅ |
| DELETE | `/api/users/:userId/roles/:roleId` | Remove role from user | ✅ |
| DELETE | `/api/users/:id` | Delete user | ✅ |

---

### Role Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/roles/` | Get all roles | ✅ |
| GET | `/api/roles/:id` | Get role by ID | ✅ |
| GET | `/api/roles/:id/details` | Get role details (with users & menus) | ✅ |
| GET | `/api/roles/:id/users` | Get role users | ✅ |
| GET | `/api/roles/:id/menus` | Get role menus | ✅ |
| POST | `/api/roles/` | Create new role | ✅ |
| PUT | `/api/roles/:id` | Update role | ✅ |
| POST | `/api/roles/:id/users` | Assign user to role | ✅ |
| POST | `/api/roles/:id/users/bulk-assign` | Bulk assign users to role | ✅ |
| POST | `/api/roles/:id/users/bulk-remove` | Bulk remove users from role | ✅ |
| POST | `/api/roles/:id/menus` | Assign menu to role | ✅ |
| DELETE | `/api/roles/:roleId/users/:userId` | Remove user from role | ✅ |
| DELETE | `/api/roles/:roleId/menus/:menuId` | Remove menu from role | ✅ |
| DELETE | `/api/roles/:id` | Delete role | ✅ |

---

### Menu Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/menus/` | Get all menus (flat) | ✅ |
| GET | `/api/menus/hierarchical` | Get hierarchical menus | ✅ |
| GET | `/api/menus/:id` | Get menu by ID | ✅ |
| GET | `/api/menus/code/:code` | Get menu by code | ✅ |
| GET | `/api/menus/role/:roleId` | Get menus by role | ✅ |
| GET | `/api/menus/:id/children` | Get menu children | ✅ |
| POST | `/api/menus/` | Create new menu | ✅ |
| PUT | `/api/menus/:id` | Update menu | ✅ |
| DELETE | `/api/menus/:id` | Delete menu | ✅ |

---

## Response Format Standards

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Authentication Flow

### Single Role User
```
1. POST /api/auth/login
   → Response includes: user, role, token, menus
   → Save token to localStorage
   → Redirect to dashboard
```

### Multiple Role User
```
1. POST /api/auth/login
   → Response includes: user, roles, requireRoleSelection: true
   → Show role selection page

2. POST /api/auth/select-role
   → Response includes: user, role, token, menus
   → Save token to localStorage
   → Redirect to dashboard
```

---

## Permission System

### Menu Permissions
Each menu has 3 permission flags:
- `can_create`: Can create new records
- `can_update`: Can update existing records
- `can_delete`: Can delete records

### Usage in Frontend
```javascript
// Check if user can access menu
if (menus.some(m => m.menu_code === 'MENU_USER_LIST')) {
  // Show menu
}

// Check if user can create
const menu = menus.find(m => m.menu_code === 'MENU_USER_LIST');
if (menu && menu.can_create) {
  // Show create button
}
```

---

## Common Use Cases

### 1. User Login Flow
```
POST /api/auth/login
  ↓
If requireRoleSelection:
  POST /api/auth/select-role
  ↓
GET /api/auth/profile (to verify token)
  ↓
Dashboard with menus
```

### 2. Create User with Role
```
POST /api/users/
  ↓
POST /api/users/:id/roles
  ↓
GET /api/users/:id (to verify)
```

### 3. Manage Role Permissions
```
POST /api/roles/
  ↓
POST /api/roles/:id/menus (assign menu 1)
POST /api/roles/:id/menus (assign menu 2)
  ↓
GET /api/roles/:id/details (to verify)
```

### 4. Switch User Role
```
GET /api/auth/profile (get available roles)
  ↓
POST /api/auth/select-role (with new role_id)
  ↓
Update localStorage with new token & menus
  ↓
Reload dashboard
```

---

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET/PUT/DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Invalid/expired token |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (e.g., username exists) |
| 500 | Internal Server Error | Server error |

---

## Request Examples

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"karyawan1","password":"karyawan123"}'
```

### Get Users (with token)
```bash
curl -X GET http://localhost:3000/api/users/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create User
```bash
curl -X POST http://localhost:3000/api/users/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"password123","full_name":"New User"}'
```

### Assign Menu to Role
```bash
curl -X POST http://localhost:3000/api/roles/2/menus \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"menu_id":"1","can_create":"true","can_update":"true","can_delete":"false"}'
```

---

## Data Models Summary

### User
- `id`: Integer (primary key)
- `username`: String (unique)
- `password`: String (hashed)
- `full_name`: String
- `is_active`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Role
- `id`: Integer (primary key)
- `name`: String (unique)
- `description`: String
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Menu
- `id`: Integer (primary key)
- `menu_name`: String
- `menu_code`: String (unique)
- `parent_id`: Integer (foreign key to Menu)
- `menu_order`: Integer
- `is_active`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp

### UserRole (Junction Table)
- `user_id`: Integer (foreign key)
- `role_id`: Integer (foreign key)

### RoleMenu (Junction Table)
- `role_id`: Integer (foreign key)
- `menu_id`: Integer (foreign key)
- `can_create`: Boolean
- `can_update`: Boolean
- `can_delete`: Boolean

---

## Important Notes for Frontend Team

1. **Always include Bearer token** in Authorization header (except login/select-role)
2. **Store token securely** in localStorage/sessionStorage
3. **Clear token on 401** response and redirect to login
4. **Check permissions** before showing UI elements (Create/Edit/Delete buttons)
5. **Use hierarchical menus** endpoint for sidebar navigation
6. **Refresh token** periodically or when near expiration
7. **Handle multi-role users** by showing role selection if `requireRoleSelection: true`
8. **Validate data** on frontend before sending to API

---

**Total Endpoints:** 38  
