# UPS Reserve API Design Documentation

## Overview
This document outlines the REST API design for the UPS Reserve office space booking system, focusing on authentication, authorization, and user management.

## Base URL
```
Production: https://api.upsreserve.com/v1
Development: http://localhost:3001/api
```

## Authentication
All API endpoints (except public ones) require authentication using JWT Bearer tokens.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## API Endpoints

### 1. Authentication Endpoints

#### 1.1 Login
**POST** `/auth/login`

Authenticates a user and returns access and refresh tokens.

**Request Body:**
```json
{
  "email": "admin@upsreserve.com",
  "password": "admin123",
  "rememberMe": false
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user_123456",
    "email": "admin@upsreserve.com",
    "name": "John Doe",
    "role": "admin",
    "department": "IT",
    "employeeId": "EMP001",
    "avatar": "https://example.com/avatar.jpg",
    "permissions": [
      "seat:read",
      "seat:write",
      "seat:delete",
      "user:read",
      "user:write",
      "user:delete",
      "floor:read",
      "floor:write",
      "floor:delete",
      "booking:read",
      "booking:write",
      "booking:delete",
      "admin:all"
    ],
    "lastLogin": "2024-01-15T10:30:00Z",
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "message": "Login successful"
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "message": "Email or password is incorrect"
}
```

#### 1.2 Logout
**POST** `/auth/logout`

Invalidates the current access token.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 1.3 Refresh Token
**POST** `/auth/refresh`

Refreshes an expired access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

#### 1.4 Verify Token
**GET** `/auth/verify`

Verifies the validity of the current access token.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "user_123456",
    "email": "admin@upsreserve.com",
    "name": "John Doe",
    "role": "admin",
    "permissions": ["seat:read", "seat:write", "admin:all"]
  }
}
```

### 2. User Management Endpoints

#### 2.1 Get User Profile
**GET** `/auth/profile`

Retrieves the current user's profile information.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user": {
    "id": "user_123456",
    "email": "admin@upsreserve.com",
    "name": "John Doe",
    "role": "admin",
    "department": "IT",
    "employeeId": "EMP001",
    "avatar": "https://example.com/avatar.jpg",
    "permissions": [
      "seat:read",
      "seat:write",
      "seat:delete",
      "user:read",
      "user:write",
      "user:delete",
      "floor:read",
      "floor:write",
      "floor:delete",
      "booking:read",
      "booking:write",
      "booking:delete",
      "admin:all"
    ],
    "lastLogin": "2024-01-15T10:30:00Z",
    "isActive": true
  }
}
```

#### 2.2 Update User Profile
**PUT** `/auth/profile`

Updates the current user's profile information.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "department": "Engineering",
  "employeeId": "EMP002"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user_123456",
    "email": "admin@upsreserve.com",
    "name": "John Smith",
    "role": "admin",
    "department": "Engineering",
    "employeeId": "EMP002",
    "avatar": "https://example.com/avatar.jpg",
    "permissions": ["seat:read", "seat:write", "admin:all"],
    "lastLogin": "2024-01-15T10:30:00Z",
    "isActive": true
  }
}
```

#### 2.3 Change Password
**POST** `/auth/change-password`

Changes the current user's password.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### 2.4 Forgot Password
**POST** `/auth/forgot-password`

Sends a password reset email to the user.

**Request Body:**
```json
{
  "email": "admin@upsreserve.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

#### 2.5 Reset Password
**POST** `/auth/reset-password`

Resets the user's password using a reset token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 3. User Registration (Admin Only)

#### 3.1 Register New User
**POST** `/auth/register`

Registers a new user (admin only).

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "email": "newuser@upsreserve.com",
  "password": "password123",
  "name": "Jane Smith",
  "role": "employee",
  "department": "Marketing",
  "employeeId": "EMP003"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "user_789012",
    "email": "newuser@upsreserve.com",
    "name": "Jane Smith",
    "role": "employee",
    "department": "Marketing",
    "employeeId": "EMP003",
    "permissions": [
      "seat:read",
      "booking:read",
      "booking:write"
    ],
    "isActive": true
  },
  "message": "User registered successfully"
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `TOKEN_INVALID` | 401 | Invalid or malformed token |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `USER_NOT_FOUND` | 404 | User not found |
| `EMAIL_ALREADY_EXISTS` | 409 | Email address already registered |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `INTERNAL_SERVER_ERROR` | 500 | Internal server error |

### Example Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "TOKEN_EXPIRED",
  "message": "Access token has expired. Please refresh your token.",
  "code": "TOKEN_EXPIRED"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "INSUFFICIENT_PERMISSIONS",
  "message": "You don't have permission to perform this action",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

**422 Validation Error:**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": ["Email is required"],
    "password": ["Password must be at least 6 characters"]
  }
}
```

## User Roles and Permissions

### Roles Hierarchy
1. **Admin** - Full system access
2. **Manager** - Department-level access
3. **Employee** - Basic booking access
4. **Guest** - Read-only access

### Permission Matrix

| Permission | Admin | Manager | Employee | Guest |
|------------|-------|---------|----------|-------|
| `seat:read` | ✅ | ✅ | ✅ | ✅ |
| `seat:write` | ✅ | ✅ | ❌ | ❌ |
| `seat:delete` | ✅ | ❌ | ❌ | ❌ |
| `user:read` | ✅ | ✅ | ❌ | ❌ |
| `user:write` | ✅ | ❌ | ❌ | ❌ |
| `user:delete` | ✅ | ❌ | ❌ | ❌ |
| `floor:read` | ✅ | ✅ | ✅ | ✅ |
| `floor:write` | ✅ | ✅ | ❌ | ❌ |
| `floor:delete` | ✅ | ❌ | ❌ | ❌ |
| `booking:read` | ✅ | ✅ | ✅ | ✅ |
| `booking:write` | ✅ | ✅ | ✅ | ❌ |
| `booking:delete` | ✅ | ✅ | ❌ | ❌ |
| `admin:all` | ✅ | ❌ | ❌ | ❌ |

## Security Considerations

### JWT Token Configuration
- **Access Token Expiry**: 1 hour (3600 seconds)
- **Refresh Token Expiry**: 7 days (604800 seconds)
- **Algorithm**: HS256
- **Issuer**: UPS Reserve API
- **Audience**: UPS Reserve Frontend

### Password Requirements
- Minimum 6 characters
- Recommended: uppercase, lowercase, numbers, special characters
- Stored using bcrypt with salt rounds: 12

### Rate Limiting
- **Login attempts**: 5 per 15 minutes per IP
- **Password reset**: 3 per hour per email
- **API requests**: 1000 per hour per user

### CORS Configuration
```javascript
{
  origin: ['https://upsreserve.com', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

## Testing Examples

### cURL Examples

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@upsreserve.com",
    "password": "admin123"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Update Profile:**
```bash
curl -X PUT http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "department": "Engineering"
  }'
```

### JavaScript/Fetch Examples

**Login:**
```javascript
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@upsreserve.com',
    password: 'admin123'
  })
});

const loginData = await loginResponse.json();
localStorage.setItem('token', loginData.token);
```

**Authenticated Request:**
```javascript
const profileResponse = await fetch('http://localhost:3001/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  }
});

const profileData = await profileResponse.json();
```

## Environment Variables

### Required Environment Variables
```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ups_reserve

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# CORS
ALLOWED_ORIGINS=https://upsreserve.com,http://localhost:3000
```

## API Versioning

The API uses URL versioning:
- Current version: `/v1`
- Future versions: `/v2`, `/v3`, etc.

## Monitoring and Logging

### Request Logging
All API requests are logged with:
- Timestamp
- Method and endpoint
- User ID (if authenticated)
- IP address
- Response status
- Response time

### Error Logging
Errors are logged with:
- Error stack trace
- Request details
- User context
- Severity level

## Support

For API support and questions:
- Email: api-support@upsreserve.com
- Documentation: https://docs.upsreserve.com/api
- Status page: https://status.upsreserve.com 