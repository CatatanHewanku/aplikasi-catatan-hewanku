import { OwnerModel } from "../models/OwnerModel.js"
import { uploadToCloudinary } from "../config/cloudinary.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export class OwnerController {
  static async createOwner(req, res) {
    try {
      const { owner_name, owner_email, password, owner_phone_number, device_id } = req.body

      if (!owner_name || !owner_email || !password || !owner_phone_number) {
        return res.status(400).json({ message: "All fields are required" })
      }

      // Check if email already exists
      const existingEmail = await OwnerModel.getOwnerByEmail(owner_email)
      if (existingEmail) {
        return res.status(409).json({ message: "Email already registered" })
      }

      // Check if phone number already exists
      const existingPhone = await OwnerModel.getOwnerByPhone(owner_phone_number)
      if (existingPhone) {
        return res.status(409).json({ message: "Phone number already registered" })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const result = await OwnerModel.createOwner(
        owner_name, 
        owner_email, 
        hashedPassword,
        owner_phone_number
      )

      // Generate JWT token (like login)
      const token = jwt.sign(
        { owner_id: result.owner_id, owner_email: result.owner_email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )

      // Create session with device_id
      if (device_id) {
        const { UserSessionModel } = await import("../models/UserSessionModel.js")
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        await UserSessionModel.createSession(result.owner_id, device_id, token, expiresAt)
      }

      res.status(201).json({ 
        message: "User created successfully",
        token: token,
        owner: {
          owner_id: result.owner_id,
          owner_name: result.owner_name,
          owner_email: result.owner_email,
          owner_phone_number: result.owner_phone_number
        }
      })
    } catch (err) {
      console.error("Create Owner Error:", err)
      res.status(500).json({ message: err.message })
    }
  }

  static async getOwner(req, res) {
    try {
      const { owner_id } = req.params

      if (!owner_id) {
        return res.status(400).json({ message: "Owner ID is required" })
      }

      const owner = await OwnerModel.getOwnerById(owner_id)

      if (!owner) {
        return res.status(404).json({ message: "User not found" })
      }

      res.status(200).json({ message: "User retrieved successfully", data: owner })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async getOwnerByEmail(req, res) {
    try {
      const { owner_email } = req.params

      if (!owner_email) {
        return res.status(400).json({ message: "Email is required" })
      }

      const owner = await OwnerModel.getOwnerByEmail(owner_email)

      if (!owner) {
        return res.status(404).json({ message: "User not found" })
      }

      res.status(200).json({ message: "User retrieved successfully", data: owner })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async getOwnerByPhone(req, res) {
    try {
      const { owner_phone_number } = req.params

      if (!owner_phone_number) {
        return res.status(400).json({ message: "Phone number is required" })
      }

      const owner = await OwnerModel.getOwnerByPhone(owner_phone_number)

      if (!owner) {
        return res.status(404).json({ message: "User not found" })
      }

      res.status(200).json({ message: "User retrieved successfully", data: owner })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async getAllOwners(req, res) {
    try {
      const owners = await OwnerModel.getAllOwners()
      res.status(200).json({ message: "Users retrieved successfully", data: owners })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async updateOwner(req, res) {
    try {
      const { owner_id } = req.params
      const { owner_name, owner_email, owner_phone_number, password } = req.body

      if (!owner_id) {
        return res.status(400).json({ message: "Owner ID is required" })
      }

      // Get current owner data
      const currentOwner = await OwnerModel.getOwnerById(owner_id)
      if (!currentOwner) {
        return res.status(404).json({ message: "Owner not found" })
      }

      // Use provided values or keep existing ones
      const name = owner_name || currentOwner.owner_name
      const email = owner_email || currentOwner.owner_email
      const phone = owner_phone_number || currentOwner.owner_phone_number
      let imageUrl = currentOwner.owner_image_url

      // Check for duplicate email (if email is being changed)
      if (email && email !== currentOwner.owner_email) {
        const existingEmail = await OwnerModel.getOwnerByEmail(email)
        if (existingEmail) {
          return res.status(409).json({ message: "Email already registered" })
        }
      }

      // Check for duplicate phone (if phone is being changed)
      if (phone && phone !== currentOwner.owner_phone_number) {
        const existingPhone = await OwnerModel.getOwnerByPhone(phone)
        if (existingPhone) {
          return res.status(409).json({ message: "Phone number already registered" })
        }
      }

      // If new image uploaded, save to Cloudinary
      if (req.file) {
        const cloudinaryResult = await uploadToCloudinary(req.file, "catatanhewanku/owners")
        imageUrl = cloudinaryResult.secure_url
      }

      // Update all fields
      await OwnerModel.updateOwnerFull(owner_id, name, email, phone, imageUrl)

      // Update password if provided
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        await OwnerModel.updatePassword(owner_id, hashedPassword)
      }

      res.status(200).json({ 
        message: "User updated successfully",
        data: { owner_id, owner_name: name, owner_email: email, owner_phone_number: phone, owner_image_url: imageUrl }
      })
    } catch (err) {
      console.error("Update Owner Error:", err)
      res.status(500).json({ message: err.message })
    }
  }

  static async deleteOwner(req, res) {
    try {
      const { owner_id } = req.params

      if (!owner_id) {
        return res.status(400).json({ message: "User ID is required" })
      }

      const result = await OwnerModel.deleteOwner(owner_id)
      res.status(200).json({ message: "User deleted successfully", data: result })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async uploadOwnerImage(req, res) {
    try {
      const { owner_id } = req.params

      if (!owner_id) {
        return res.status(400).json({ message: "Owner ID is required" })
      }

      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" })
      }

      // Upload to Cloudinary in owners folder
      const result = await uploadToCloudinary(req.file, "catatanhewanku/owners")

      // Update owner with image URL
      await OwnerModel.updateOwnerImage(owner_id, result.secure_url)

      res.status(200).json({ 
        message: "Image uploaded successfully",
        image_url: result.secure_url
      })
    } catch (err) {
      console.error("Upload Owner Image Error:", err)
      res.status(500).json({ message: err.message })
    }
  }
}
