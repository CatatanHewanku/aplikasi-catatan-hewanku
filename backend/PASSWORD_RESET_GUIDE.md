# Password Reset Feature - Testing Guide

## 📋 Prerequisites

1. **Packages installed:**
   ```bash
   npm install jsonwebtoken nodemailer bcryptjs
   ```

2. **PasswordReset table created in SSMS:**
   ```sql
   CREATE TABLE PasswordReset (
       reset_id INT PRIMARY KEY IDENTITY(1,1),
       owner_id INT NOT NULL,
       reset_token VARCHAR(255) NOT NULL UNIQUE,
       token_expiry DATETIME NOT NULL,
       is_used BIT DEFAULT 0,
       created_at DATETIME DEFAULT GETDATE(),
       FOREIGN KEY (owner_id) REFERENCES PetOwner(owner_id) ON DELETE CASCADE
   )
   ```

3. **.env file updated** with email credentials

---

## 🧪 Test Steps in Postman

### Step 1: Create an Owner (if not already done)

**POST** `http://localhost:4000/api/owners`

```json
{
  "owner_name": "John Doe",
  "owner_email": "john@example.com",
  "password": "Password123",
  "owner_phone_number": "08123456789"
}
```

**Response:**
```json
{
  "message": "Owner created successfully",
  "data": {
    "owner_id": 1
  }
}
```

---

### Step 2: Request Password Reset

**POST** `http://localhost:4000/api/auth/forgot-password`

```json
{
  "owner_email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset link sent to your email. Check your inbox.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**📧 Email Received:**
- Check your email inbox for the reset link
- Or use the `token` from the response

---

### Step 3: Reset Password (using token)

**POST** `http://localhost:4000/api/auth/reset-password`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "new_password": "NewPassword456"
}
```

**Response:**
```json
{
  "message": "Password reset successfully. You can now login."
}
```

---

## ⚠️ Error Cases to Test

### Test 1: Non-existent Email
**POST** `http://localhost:4000/api/auth/forgot-password`
```json
{
  "owner_email": "nonexistent@example.com"
}
```
**Expected Response:** `404 - Email not found in our system`

---

### Test 2: Invalid Token
**POST** `http://localhost:4000/api/auth/reset-password`
```json
{
  "token": "invalid.token.here",
  "new_password": "NewPassword456"
}
```
**Expected Response:** `400 - Invalid token`

---

### Test 3: Expired Token
- Wait 1 hour, then try to use the same token
**Expected Response:** `400 - Token has expired`

---

### Test 4: Already Used Token
- Use the same token twice
**Expected Response:** `400 - Token has already been used`

---

### Test 5: Missing Fields
**POST** `http://localhost:4000/api/auth/forgot-password`
```json
{
  "owner_email": ""
}
```
**Expected Response:** `400 - Email is required`

---

## 📧 Email Configuration

### For Gmail:
1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password in `.env` as `EMAIL_PASSWORD`

### Example .env:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
JWT_SECRET=your_super_secret_key
```

---

## ✅ How It Works

1. **Forgot Password Flow:**
   - User enters email
   - Backend checks if email exists
   - Backend generates JWT token (expires in 1 hour)
   - Backend saves token to PasswordReset table
   - Backend sends email with reset link
   - Response includes token for testing

2. **Reset Password Flow:**
   - User receives email with token
   - User clicks link and enters new password
   - Backend verifies token is valid
   - Backend verifies token hasn't expired
   - Backend verifies token hasn't been used
   - Backend hashes new password
   - Backend updates password in database
   - Backend marks token as used

---

## 🔒 Security Features

✅ Token expires in 1 hour  
✅ Token can only be used once  
✅ Password hashed before storage  
✅ Token verified before password reset  
✅ Email verification required  

---

## 📝 Database Check

Check tokens in SSMS:
```sql
SELECT * FROM PasswordReset WHERE owner_id = 1
```

Check password updated:
```sql
SELECT owner_id, owner_email, owner_password_hash FROM PetOwner WHERE owner_id = 1
```
