# Password Reset with Verification Code - Testing Guide

## 📱 New Flow (Verification Code Instead of Email Link)

```
1. User requests password reset
2. Backend generates 6-digit code (e.g., 483921)
3. Email sends the code
4. User enters code in app
5. Backend verifies code
6. If correct → User enters new password
7. Backend updates password
```

---

## 🧪 Postman Testing Steps

### Step 1: Request Password Reset

**POST** `http://localhost:4000/api/auth/forgot-password`

```json
{
  "owner_email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "Verification code sent to your email",
  "owner_id": 1
}
```

**📧 Email Received:**
Shows 6-digit code like: **483921**

---

### Step 2: Verify the Code

**POST** `http://localhost:4000/api/auth/verify-code`

```json
{
  "owner_id": 1,
  "verification_code": "483921"
}
```

**Response (200):**
```json
{
  "message": "Code verified successfully",
  "owner_id": 1,
  "reset_id": 1
}
```

---

### Step 3: Reset Password

**POST** `http://localhost:4000/api/auth/reset-password`

```json
{
  "owner_id": 1,
  "new_password": "NewPassword456"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully. You can now login."
}
```

---

## ⚠️ Error Cases

### Invalid Code
```json
{
  "owner_id": 1,
  "verification_code": "000000"
}
```
**Response:** `400 - Invalid verification code`

---

### Code Expired (after 10 minutes)
**Response:** `400 - Code has expired. Request a new one.`

---

### Too Many Failed Attempts (3+ times)
**Response:** `400 - Too many failed attempts. Request a new code.`

---

### Code Already Used
**Response:** `400 - Code has already been used`

---

## 📊 Database Check

Check codes in SSMS:
```sql
SELECT * FROM PasswordReset 
WHERE owner_id = 1
ORDER BY created_at DESC
```

**Columns:**
- `verification_code` - 6-digit code
- `token_expiry` - When code expires
- `code_attempts` - Number of failed attempts
- `is_used` - Whether code has been used

---

## ✅ Advantages of Verification Code

✅ More user-friendly (no link clicking)  
✅ Code-based authentication  
✅ Better for mobile apps  
✅ Short expiry (10 minutes)  
✅ Attempt limiting (max 3 tries)  
✅ No need for JWT_SECRET  

---

## 🔒 Security Features

✅ 6-digit code (1 in 1 million)  
✅ 10-minute expiry  
✅ One-time use only  
✅ Max 3 failed attempts  
✅ Code stored in database (not in URL)  
✅ Password hashed before storage  

---

## 📝 Full Workflow Example

**Day 1:**
```
User: "I forgot password"
App: POST /api/auth/forgot-password
     → Send code via email
User: Receives email with code 483921
User: Enters code in app
App: POST /api/auth/verify-code
    → Code verified ✅
User: Enters new password
App: POST /api/auth/reset-password
     → Password updated ✅
User: Can now login with new password
```

Done! 🚀
