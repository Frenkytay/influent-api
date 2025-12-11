# 🚀 Quick Start Guide - Using the OOP Architecture

## 📋 Table of Contents
1. [Basic CRUD Operations](#basic-crud-operations)
2. [Authentication & Authorization](#authentication--authorization)
3. [File Uploads](#file-uploads)
4. [Email Sending](#email-sending)
5. [Payment Processing](#payment-processing)
6. [Real-time Chat](#real-time-chat)
7. [Error Handling](#error-handling)

## Basic CRUD Operations

### **Using Built-in Base Class Methods**

All controllers inherit from `BaseController` which provides standard CRUD operations:

```javascript
// GET /api/v1/users - Get all users
// Automatically handles pagination, filtering, sorting

// GET /api/v1/users/:id - Get user by ID
// Automatically handles 404 if not found

// POST /api/v1/users - Create user
// Request body: { name, email, password, role }

// PUT /api/v1/users/:id - Update user
// Request body: { name: "New Name" }

// DELETE /api/v1/users/:id - Delete user
// Automatically handles 404 if not found
```

### **Custom Business Logic**

```javascript
// Example: Get current user profile
// GET /api/v1/users/me
// Headers: Authorization: Bearer <token>

// Example: Update current user profile
// PUT /api/v1/users/me
// Headers: Authorization: Bearer <token>
// Body: { name: "John Doe", bio: "Developer" }
```

## Authentication & Authorization

### **1. Register New User**

```javascript
// POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "student" // or "business" or "admin"
}

// Response:
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "user_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    }
  }
}
```

### **2. Verify OTP**

```javascript
// POST /api/v1/auth/verify-otp
{
  "email": "john@example.com",
  "otp": "123456"
}

// Response:
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **3. Login**

```javascript
// POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

// Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **4. Protected Routes**

```javascript
// Any protected route requires Authorization header
// GET /api/v1/users/me
// Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **5. Role-Based Access**

```javascript
// Admin-only route example
// DELETE /api/v1/users/:id
// Headers: Authorization: Bearer <admin_token>

// Business-only route example
// POST /api/v1/campaigns
// Headers: Authorization: Bearer <business_token>

// Student-only route example
// POST /api/v1/campaign-users
// Headers: Authorization: Bearer <student_token>
```

## File Uploads

### **1. Single Image Upload**

```javascript
// POST /api/v1/upload
// Headers:
{
  "Authorization": "Bearer <token>",
  "Content-Type": "multipart/form-data"
}
// Body (form-data):
{
  "file": <image_file>  // Max 5MB, jpg/png/gif/webp
}

// Response:
{
  "success": true,
  "data": {
    "url": "/uploads/image-1234567890.jpg",
    "filename": "image-1234567890.jpg"
  }
}
```

### **2. Multiple Files Upload**

```javascript
// POST /api/v1/upload/multiple
// Body (form-data):
{
  "files": [<file1>, <file2>, <file3>]  // Max 10 files
}
```

### **3. Document Upload**

```javascript
// POST /api/v1/upload/document
// Body (form-data):
{
  "file": <pdf_or_doc>  // Max 10MB, pdf/doc/docx/xls/xlsx
}
```

## Email Sending

### **Emails are sent automatically by the system:**

```javascript
// 1. OTP Email - Sent during registration
//    Triggered by: POST /api/v1/auth/register

// 2. Password Reset Email - Sent during forgot password
//    Triggered by: POST /api/v1/auth/forgot-password

// 3. Welcome Email - Sent after email verification
//    Triggered by: POST /api/v1/auth/verify-otp

// 4. Withdrawal Request Email - Sent when withdrawal requested
//    Triggered by: POST /api/v1/withdrawals/request

// 5. Withdrawal Completed Email - Sent when withdrawal completed
//    Triggered by: POST /api/v1/withdrawals/:id/complete

// 6. Withdrawal Rejected Email - Sent when withdrawal rejected
//    Triggered by: POST /api/v1/withdrawals/:id/reject
```

### **Manual Email Sending (in your code):**

```javascript
import EmailService from "./src/services/EmailService.js";

// Send OTP
await EmailService.sendOTPEmail("user@example.com", "John Doe", "123456");

// Send welcome email
await EmailService.sendWelcomeEmail("user@example.com", "John Doe");

// Send custom email (extend the service)
class MyEmailService extends EmailService {
  async sendCustomEmail(email, data) {
    const mailOptions = {
      from: this.getFromAddress(),
      to: email,
      subject: "Custom Subject",
      html: this.getCustomTemplate(data),
    };
    return await this.transporter.sendMail(mailOptions);
  }
}
```

## Payment Processing

### **1. Create Payment (Midtrans)**

```javascript
// POST /api/v1/payments/create
// Headers: Authorization: Bearer <token>
{
  "campaign_id": 123,
  "user_id": 456
}

// Response:
{
  "success": true,
  "data": {
    "payment": {
      "order_id": "CAMPAIGN-123-1234567890-456",
      "amount": 500000,
      "status": "pending"
    },
    "snap": {
      "token": "snap_token_here",
      "redirect_url": "https://app.midtrans.com/snap/v2/..."
    }
  }
}

// Frontend: Redirect user to snap.redirect_url
```

### **2. Payment Notification (Webhook)**

```javascript
// POST /api/v1/payments/notification
// Called automatically by Midtrans
// No authentication required (handled by Midtrans signature)
```

### **3. Payment Return Handler**

```javascript
// GET /api/v1/payments/return?order_id=CAMPAIGN-123-1234567890-456
// User is redirected here after payment
// System automatically redirects to frontend with status
```

### **4. Pay Students for Campaign**

```javascript
// Pay single student
// POST /api/v1/campaign-payments/pay-student
// Headers: Authorization: Bearer <business_token>
{
  "campaign_user_id": 789,
  "amount": 100000,
  "description": "Payment for Instagram post"
}

// Pay all students in campaign
// POST /api/v1/campaign-payments/pay-all
{
  "campaign_id": 123,
  "amount": 50000
}

// Pay custom amounts
// POST /api/v1/campaign-payments/pay-custom
{
  "payments": [
    { "campaign_user_id": 1, "amount": 100000 },
    { "campaign_user_id": 2, "amount": 150000 }
  ]
}
```

### **5. Withdrawal Workflow**

```javascript
// Step 1: Student requests withdrawal
// POST /api/v1/withdrawals/request
// Headers: Authorization: Bearer <student_token>
{
  "amount": 50000,
  "bank_name": "BCA",
  "account_number": "1234567890",
  "account_holder_name": "John Doe"
}

// Step 2: Admin approves withdrawal
// POST /api/v1/withdrawals/:id/approve
// Headers: Authorization: Bearer <admin_token>

// Step 3: Admin completes withdrawal (with proof)
// POST /api/v1/withdrawals/:id/complete
// Headers: Authorization: Bearer <admin_token>
// Body (form-data):
{
  "transfer_proof": <file>,
  "admin_notes": "Transferred successfully"
}

// Alternative: Admin rejects withdrawal
// POST /api/v1/withdrawals/:id/reject
{
  "rejection_reason": "Insufficient information"
}
```

## Real-time Chat

### **1. Frontend Setup (Socket.IO Client)**

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "your_jwt_token_here"
  }
});

socket.on("connect", () => {
  console.log("Connected to chat server");
});

socket.on("error", (error) => {
  console.error("Socket error:", error.message);
});
```

### **2. Join Chat Room**

```javascript
socket.emit("joinRoom", { roomId: 123 });

socket.on("joinedRoom", (data) => {
  console.log("Joined room:", data.roomId);
});
```

### **3. Send Message**

```javascript
socket.emit("sendMessage", {
  roomId: 123,
  content: "Hello!",
  contentType: "text"
});
```

### **4. Receive Messages**

```javascript
socket.on("newMessage", (message) => {
  console.log("New message:", message);
  // {
  //   id: 456,
  //   chat_room_id: 123,
  //   user_id: 789,
  //   content: "Hello!",
  //   content_type: "text",
  //   timestamp: "2025-12-11T10:30:00.000Z",
  //   User: {
  //     user_id: 789,
  //     name: "John Doe",
  //     profile_image: "/uploads/profile.jpg"
  //   }
  // }
});
```

### **5. Typing Indicator**

```javascript
// Send typing status
socket.emit("typing", { roomId: 123, isTyping: true });

// Receive typing status from others
socket.on("userTyping", (data) => {
  console.log(`User ${data.userId} is typing: ${data.isTyping}`);
});
```

### **6. Mark Message as Read**

```javascript
socket.emit("markAsRead", { messageId: 456 });

socket.on("messageRead", (data) => {
  console.log("Message marked as read:", data.messageId);
});
```

### **7. Leave Room**

```javascript
socket.emit("leaveRoom", { roomId: 123 });
```

## Error Handling

### **Standard Error Response Format**

```javascript
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {...}  // Optional, only in development mode
}
```

### **Common HTTP Status Codes**

```javascript
200 - OK (Success)
201 - Created (Resource created successfully)
400 - Bad Request (Validation error, missing fields)
401 - Unauthorized (Missing or invalid token)
403 - Forbidden (Insufficient permissions)
404 - Not Found (Resource doesn't exist)
409 - Conflict (Duplicate entry, e.g., email already exists)
429 - Too Many Requests (Rate limit exceeded)
500 - Internal Server Error (Server-side error)
```

### **Error Examples**

```javascript
// Validation Error
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Email is required" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}

// Authentication Error
{
  "success": false,
  "error": "Authentication failed",
  "message": "Token expired"
}

// Authorization Error
{
  "success": false,
  "error": "Access denied",
  "message": "This action requires one of these roles: admin"
}

// Not Found Error
{
  "success": false,
  "error": "Resource not found",
  "message": "User with ID 999 not found"
}

// Duplicate Entry Error
{
  "success": false,
  "error": "email already exists",
  "details": [...]
}
```

## 🧪 Testing Examples

### **Using cURL**

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123!","role":"student"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'

# Get profile (with token)
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Create campaign
curl -X POST http://localhost:3000/api/v1/campaigns \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Campaign","category":"beauty","budget":1000000}'
```

### **Using Postman**

1. Create new request
2. Set method (GET, POST, PUT, DELETE)
3. Set URL: `http://localhost:3000/api/v1/<endpoint>`
4. Add headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer <token>` (for protected routes)
5. Add body (for POST/PUT):
   - Select "raw" and "JSON"
   - Enter JSON data
6. Click "Send"

## 📚 Additional Resources

- **Architecture Guide**: See `OOP_ARCHITECTURE.md`
- **Complete Migration Summary**: See `COMPLETE_OOP_MIGRATION.md`
- **API Documentation**: Visit `/api/docs` when server is running

## 🆘 Common Issues

### **Issue: "Authorization header missing"**
**Solution**: Add `Authorization: Bearer <token>` header to protected routes

### **Issue: "Token expired"**
**Solution**: Login again to get a new token

### **Issue: "Access denied"**
**Solution**: Your role doesn't have permission. Check if endpoint requires admin/business/student role

### **Issue: "File too large"**
**Solution**: 
- Images: Max 5MB
- Documents: Max 10MB
- Videos: Max 100MB

### **Issue: "Socket connection failed"**
**Solution**: 
- Ensure JWT token is valid
- Check if token is passed in auth object during connection
- Verify CORS settings allow your frontend origin

---

**Last Updated**: December 11, 2025  
**Server URL**: `http://localhost:3000`  
**API Base Path**: `/api/v1`  
**WebSocket**: `ws://localhost:3000`
