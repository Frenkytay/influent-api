# Email Verification with OTP

## Overview

Users must verify their email with a 6-digit OTP code after registration before they can login.

## Setup

### 1. Install Dependencies

```bash
npm install nodemailer
```

### 2. Run Database Migration

```bash
mysql -u root -p your_database < migrations/add_email_verification.sql
```

### 3. Configure Email Service

Add these to your `.env` file:

```env
# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Gmail Setup (Recommended for Development):

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Go to https://myaccount.google.com/apppasswords
4. Create app password for "Mail"
5. Use that 16-character password as `SMTP_PASS`

### Alternative Email Services:

**Mailtrap (Testing):**

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
```

**SendGrid:**

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## API Usage

### 1. Register User (Sends OTP)

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@ui.ac.id",
  "password": "password123",
  "role": "student"
}
```

**Response:**

```json
{
  "message": "Registration successful. Please verify your email with the OTP sent to your inbox.",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@ui.ac.id",
    "role": "student",
    "email_verified": false
  },
  "otp": "123456" // Only in development
}
```

User receives email with OTP code.

### 2. Verify OTP

```bash
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "john@ui.ac.id",
  "otp": "123456"
}
```

**Response:**

```json
{
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@ui.ac.id",
    "role": "student",
    "email_verified": true
  }
}
```

User is now verified and receives welcome email.

### 3. Resend OTP (if expired or lost)

```bash
POST /api/v1/auth/resend-otp
Content-Type: application/json

{
  "email": "john@ui.ac.id"
}
```

**Response:**

```json
{
  "message": "OTP has been resent to your email",
  "otp": "654321" // Only in development
}
```

### 4. Login (Requires Verified Email)

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@ui.ac.id",
  "password": "password123"
}
```

**Success Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@ui.ac.id",
    "role": "student",
    "email_verified": true
  }
}
```

**If Email Not Verified:**

```json
{
  "error": "Email not verified. Please verify your email before logging in.",
  "email_verified": false
}
```

## Frontend Implementation

### Registration Flow

```javascript
// 1. Register user
const register = async (name, email, password, role) => {
  const response = await fetch("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });

  const data = await response.json();

  if (response.ok) {
    // Show OTP input form
    showOTPForm(email);
  }
};

// 2. Verify OTP
const verifyOTP = async (email, otp) => {
  const response = await fetch("/api/v1/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();

  if (response.ok) {
    // Save token
    localStorage.setItem("token", data.token);

    // Redirect to dashboard
    window.location.href = "/dashboard";
  }
};

// 3. Resend OTP
const resendOTP = async (email) => {
  const response = await fetch("/api/v1/auth/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  alert(data.message);
};
```

### React Component Example

```jsx
import { useState } from "react";

function RegistrationFlow() {
  const [step, setStep] = useState("register"); // 'register' or 'verify'
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const response = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    if (response.ok) {
      setStep("verify");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/v1/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    }
  };

  if (step === "register") {
    return (
      <form onSubmit={handleRegister}>
        <input name="name" placeholder="Full Name" required />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <select name="role" required>
          <option value="student">Student</option>
          <option value="company">Company</option>
        </select>
        <button type="submit">Register</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOTP}>
      <h2>Verify Your Email</h2>
      <p>We sent a 6-digit code to {email}</p>
      <input
        value={otp}
        onChange={(e) => setOTP(e.target.value)}
        placeholder="Enter OTP"
        maxLength="6"
        required
      />
      <button type="submit">Verify</button>
      <button type="button" onClick={() => resendOTP(email)}>
        Resend OTP
      </button>
    </form>
  );
}
```

## Features

- ✅ **6-digit OTP** generated randomly
- ✅ **10-minute expiration** for security
- ✅ **5 failed attempts** maximum before blocking
- ✅ **Email templates** with beautiful HTML design
- ✅ **Resend OTP** functionality
- ✅ **Welcome email** after verification
- ✅ **Login blocked** until email verified
- ✅ **Development mode** shows OTP in API response

## Security Features

- OTP expires after 10 minutes
- Maximum 5 failed verification attempts
- OTP is cleared after successful verification
- Attempts counter reset when resending OTP
- Login requires verified email

## Testing

**Development Mode** (NODE_ENV !== "production"):

- OTP is returned in API response for easy testing
- Check server console for email logs

**Production Mode**:

- OTP only sent via email
- No OTP in API responses
- Use real email service

## Troubleshooting

**OTP email not received:**

- Check spam/junk folder
- Verify SMTP credentials in .env
- Check server logs for errors
- Test with Mailtrap first

**Gmail "Less secure app" error:**

- Use App Password instead of regular password
- Enable 2-Step Verification first

**OTP expired:**

- Use resend-otp endpoint
- Increase OTP_EXPIRES_MINUTES if needed

**Too many attempts:**

- Request new OTP via resend-otp
- Attempts reset when new OTP sent
