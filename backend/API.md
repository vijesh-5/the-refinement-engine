# Artifex Backend API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

---

## 🔐 Auth Endpoints

### Signup

**POST** `/auth/signup`

Create a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### Login

**POST** `/auth/login`

Authenticate and receive tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### Refresh Token

**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

### Logout

**POST** `/auth/logout`

Invalidate refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 👤 User Endpoints

### Get Profile

**GET** `/users/profile` (Protected)

Retrieve current user profile.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "plan": "FREE",
    "createdAt": "2026-01-26T..."
  }
}
```

### Update Profile

**PATCH** `/users/profile` (Protected)

Update user profile information.

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "plan": "FREE"
  }
}
```

### Change Password

**POST** `/users/change-password` (Protected)

Change user password.

**Request Body:**

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

---

## 📝 Content Endpoints

### Create Content

**POST** `/content` (Protected)

Create new content.

**Request Body:**

```json
{
  "title": "My First Blog Post",
  "body": "This is the content of my blog post...",
  "templateId": "uuid (optional)"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Content created successfully",
  "data": {
    "id": "uuid",
    "title": "My First Blog Post",
    "body": "This is the content of my blog post...",
    "status": "DRAFT",
    "userId": "uuid",
    "templateId": "uuid",
    "createdAt": "2026-01-26T...",
    "updatedAt": "2026-01-26T..."
  }
}
```

### List Content

**GET** `/content?status=DRAFT&limit=20&offset=0` (Protected)

List user's content with pagination.

**Query Parameters:**

- `status` (optional): DRAFT or COMPLETE
- `limit` (optional, default: 20): Items per page
- `offset` (optional, default: 0): Pagination offset

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "My First Blog Post",
      "body": "...",
      "status": "DRAFT",
      "createdAt": "2026-01-26T..."
    }
  ],
  "meta": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get Content

**GET** `/content/:id` (Protected)

Retrieve a specific content item.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "My First Blog Post",
    "body": "...",
    "status": "DRAFT",
    "template": { "id": "uuid", "name": "Blog Post" }
  }
}
```

### Update Content

**PATCH** `/content/:id` (Protected)

Update content.

**Request Body:**

```json
{
  "title": "Updated Title",
  "body": "Updated content...",
  "status": "COMPLETE"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Content updated successfully",
  "data": { "id": "uuid", "title": "Updated Title", ... }
}
```

### Delete Content

**DELETE** `/content/:id` (Protected)

Delete content.

**Response (200):**

```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```

---

## 🎯 Template Endpoints

### Get All Templates

**GET** `/templates`

List all active templates.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Blog Post",
      "description": "Generate engaging blog posts...",
      "category": "Blog",
      "prompt": "Write a comprehensive blog post about {topic}...",
      "icon": "📝"
    }
  ]
}
```

### Get Template Categories

**GET** `/templates/categories`

List all template categories.

**Response (200):**

```json
{
  "success": true,
  "data": [
    "Blog",
    "E-commerce",
    "Social Media",
    "Email",
    "Advertising",
    "Video"
  ]
}
```

### Get Templates by Category

**GET** `/templates/category/:category`

Get templates for a specific category.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Blog Post",
      "description": "...",
      "category": "Blog"
    }
  ]
}
```

### Get Template Details

**GET** `/templates/:id`

Retrieve a specific template.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Blog Post",
    "description": "...",
    "prompt": "Write a comprehensive blog post about {topic}...",
    "category": "Blog"
  }
}
```

---

## 📊 Dashboard Endpoints

### Get Dashboard

**GET** `/dashboard` (Protected)

Retrieve dashboard statistics and recent content.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "plan": "FREE"
    },
    "stats": {
      "totalContent": 15,
      "drafts": 8,
      "complete": 7
    },
    "recentContent": [
      {
        "id": "uuid",
        "title": "Latest Post",
        "status": "DRAFT",
        "createdAt": "2026-01-26T..."
      }
    ]
  }
}
```

---

## ❌ Error Responses

All errors follow this format:

**Validation Error (400):**

```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

**Unauthorized (401):**

```json
{
  "success": false,
  "error": "Invalid or expired access token"
}
```

**Forbidden (403):**

```json
{
  "success": false,
  "error": "Unauthorized to update this content"
}
```

**Not Found (404):**

```json
{
  "success": false,
  "error": "Content not found"
}
```

**Conflict (409):**

```json
{
  "success": false,
  "error": "Email already registered"
}
```

**Server Error (500):**

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 🧪 Testing with cURL

### Signup

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "firstName": "Test"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### Get Profile (use token from login response)

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create Content

```bash
curl -X POST http://localhost:5000/api/content \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Post",
    "body": "Content here...",
    "status": "DRAFT"
  }'
```
