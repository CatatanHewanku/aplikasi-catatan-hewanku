import nodemailer from "nodemailer"
import bcrypt from "bcryptjs"
import { OwnerModel } from "../models/OwnerModel.js"
import { PasswordResetModel } from "../models/PasswordResetModel.js"

export class AuthController {
  // Forgot Password - Send Verification Code
  static async forgotPassword(req, res) {
    try {
      const { owner_email } = req.body

      if (!owner_email) {
        return res.status(400).json({ message: "Email is required" })
      }

      // Check if owner exists
      const owner = await OwnerModel.getOwnerByEmail(owner_email)
      if (!owner) {
        return res.status(404).json({ message: "Email not found in our system" })
      }

      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

      // Calculate expiry time (10 minutes from now)
      const codeExpiry = new Date(Date.now() + 600000)

      // Save code to database
      await PasswordResetModel.saveResetCode(owner.owner_id, verificationCode, codeExpiry)

      // Send email with verification code
      await sendVerificationCodeEmail(owner_email, verificationCode)

      res.status(200).json({ 
        message: "Verification code sent to your email",
        owner_id: owner.owner_id
      })
    } catch (err) {
      console.error("Forgot Password Error:", err)
      res.status(500).json({ message: err.message })
    }
  }

  // Verify Code - Check if code is correct
  static async verifyCode(req, res) {
    try {
      const { owner_id, verification_code } = req.body

      if (!owner_id || !verification_code) {
        return res.status(400).json({ message: "Owner ID and verification code are required" })
      }

      // Get reset code from database
      const resetRecord = await PasswordResetModel.getResetCode(owner_id, verification_code)
      if (!resetRecord) {
        // Increment failed attempts
        await PasswordResetModel.incrementCodeAttempts(owner_id)
        return res.status(400).json({ message: "Invalid verification code" })
      }

      // Check if code is already used
      if (resetRecord.is_used) {
        return res.status(400).json({ message: "Code has already been used" })
      }

      // Check if too many attempts (max 3)
      if (resetRecord.code_attempts >= 3) {
        return res.status(400).json({ message: "Too many failed attempts. Request a new code." })
      }

      // Check if code has expired
      const now = new Date()
      if (now > resetRecord.token_expiry) {
        return res.status(400).json({ message: "Code has expired. Request a new one." })
      }

      // Code is valid - return success
      res.status(200).json({ 
        message: "Code verified successfully",
        owner_id: owner_id,
        reset_id: resetRecord.reset_id
      })
    } catch (err) {
      console.error("Verify Code Error:", err)
      res.status(500).json({ message: err.message })
    }
  }

  // Reset Password - Update password after code verification
  static async resetPassword(req, res) {
    try {
      const { owner_id, new_password } = req.body

      if (!owner_id || !new_password) {
        return res.status(400).json({ message: "Owner ID and new password are required" })
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 10)

      // Update password in database
      await OwnerModel.updatePassword(owner_id, hashedPassword)

      // Mark code as used
      await PasswordResetModel.markTokenAsUsed(owner_id)

      res.status(200).json({ message: "Password reset successfully. You can now login." })
    } catch (err) {
      console.error("Reset Password Error:", err)
      res.status(500).json({ message: err.message })
    }
  }
}

// Send Verification Code Email
async function sendVerificationCodeEmail(email, verificationCode) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Verification Code - Catatan Hewanku",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2>Password Reset Request</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h1 style="letter-spacing: 5px; color: #4CAF50;">${verificationCode}</h1>
          </div>
          <p><strong>This code expires in 10 minutes.</strong></p>
          <p style="color: red;">Do not share this code with anyone.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p style="color: gray; font-size: 12px;">Catatan Hewanku - Pet Care Application</p>
        </div>
      `
    }

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Email send error:", err)
          reject(err)
        } else {
          console.log("Email sent:", info.response)
          resolve(info)
        }
      })
    })
  } catch (err) {
    console.error("Transporter error:", err)
    throw err
  }
}
