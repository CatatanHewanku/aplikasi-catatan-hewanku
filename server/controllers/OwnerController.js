import { OwnerModel } from "../models/OwnerModel.js"
import bcrypt from "bcryptjs"

export class OwnerController {
  static async createOwner(req, res) {
    try {
      const { owner_name, owner_email, password, owner_phone_number } = req.body

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
      res.status(201).json({ message: "User created successfully", data: result })
    } catch (err) {
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
      const { owner_name, owner_email, owner_phone_number } = req.body

      if (!owner_id) {
        return res.status(400).json({ message: "Owner ID is required" })
      }

      if (!owner_name || !owner_email || !owner_phone_number) {
        return res.status(400).json({ message: "All fields are required" })
      }

      const result = await OwnerModel.updateOwner(owner_id, owner_name, owner_email, owner_phone_number)
      res.status(200).json({ message: "User updated successfully", data: result })
    } catch (err) {
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
}
