import nodemailer from "nodemailer"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { OwnerModel } from "../models/OwnerModel.js"
import { PasswordResetModel } from "../models/PasswordResetModel.js"
import { UserSessionModel } from "../models/UserSessionModel.js"

export class AuthController {
  static async login(req, res) {
    try {
      const { identifier, password, device_id } = req.body

      if (!identifier || !password || !device_id) {
        return res.status(400).json({ message: "Email/Phone, password, and device_id are required" })
      }

      console.log("Login attempt with identifier:", identifier, "device:", device_id)

      const owner = await OwnerModel.getOwnerByEmailOrPhone(identifier)
      
      if (!owner) {
        return res.status(401).json({ message: "Invalid email/phone or password" })
      }
      
      const isPasswordValid = await bcrypt.compare(password, owner.owner_password_hash)    
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email/phone or password" })
      }

      const loginMethod = identifier.includes('@') ? 'email' : 'phone'

      const token = jwt.sign(
        { owner_id: owner.owner_id, owner_email: owner.owner_email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      await UserSessionModel.createSession(owner.owner_id, device_id, token, expiresAt)

      res.status(200).json({
        message: "Login successful",
        token: token,
        owner: {
          owner_id: owner.owner_id,
          owner_name: owner.owner_name,
          owner_email: owner.owner_email,
          owner_phone_number: owner.owner_phone_number,
          owner_image_url: owner.owner_image_url
        }
      })
    } catch (err) {
      console.error("Login Error:", err)
      res.status(500).json({ message: err.message })
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { identifier } = req.body

      if (!identifier) {
        return res.status(400).json({ message: "Email or phone number is required" })
      }

      const owner = await OwnerModel.getOwnerByEmailOrPhone(identifier)
      if (!owner) {
        return res.status(404).json({ message: "Email or phone number not found in our system" })
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      const codeExpiry = new Date(Date.now() + 600000)

      await PasswordResetModel.saveResetCode(owner.owner_id, verificationCode, codeExpiry)
      await sendVerificationCodeEmail(owner.owner_email, verificationCode)

      res.status(200).json({ 
        message: "Verification code sent to your email",
        owner_id: owner.owner_id
      })
    } catch (err) {
      console.error("Forgot Password Error:", err)
      res.status(500).json({ message: err.message })
    }
  }

  static async verifyCode(req, res) {
    try {
      const { owner_id, verification_code } = req.body

      if (!owner_id || !verification_code) {
        return res.status(400).json({ message: "Owner ID and verification code are required" })
      }

      const resetRecord = await PasswordResetModel.getResetCode(owner_id, verification_code)
      if (!resetRecord) {
        await PasswordResetModel.incrementCodeAttempts(owner_id)
        return res.status(400).json({ message: "Invalid verification code" })
      }

      if (resetRecord.is_used) {
        return res.status(400).json({ message: "Code has already been used" })
      }

      if (resetRecord.code_attempts >= 3) {
        return res.status(400).json({ message: "Too many failed attempts. Request a new code." })
      }

      const now = new Date()
      if (now > resetRecord.token_expiry) {
        await PasswordResetModel.deleteExpiredCodes(owner_id)
        return res.status(400).json({ message: "Code has expired. Request a new one." })
      }

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

  static async resetPassword(req, res) {
    try {
      const { owner_id, new_password } = req.body

      if (!owner_id || !new_password) {
        return res.status(400).json({ message: "Owner ID and new password are required" })
      }

      const hashedPassword = await bcrypt.hash(new_password, 10)

      await OwnerModel.updatePassword(owner_id, hashedPassword)

      await PasswordResetModel.markTokenAsUsed(owner_id)

      res.status(200).json({ message: "Password reset successfully. You can now login." })
    } catch (err) {
      console.error("Reset Password Error:", err)
      res.status(500).json({ message: err.message })
    }
  }

  static async logout(req, res) {
    try {
      const { device_id } = req.body

      if (!device_id) {
        return res.status(400).json({ message: "Device ID is required" })
      }

      await UserSessionModel.invalidateSessionByDevice(device_id)
      res.status(200).json({ message: "Logout successful" })
    } catch (err) {
      console.error("Logout Error:", err)
      res.status(500).json({ message: err.message })
    }
  }
}

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
