import { PetModel } from "../models/PetModel.js"

export class PetController {
  static async createPet(req, res) {
    try {
      const { owner_id, pet_name, pet_type, pet_dob, pet_gender, pet_note } = req.body

      if (!owner_id || !pet_name || !pet_type || !pet_dob || !pet_gender) {
        return res.status(400).json({ message: "Required fields are missing" })
      }

      // Handle image file conversion to base64
      let pet_image = null
      let pet_image_type = null
      if (req.file) {
        const fileBuffer = req.file.buffer
        pet_image = fileBuffer.toString('base64')
        pet_image_type = req.file.mimetype
      }

      const result = await PetModel.createPet(owner_id, pet_name, pet_type, pet_dob, pet_gender, pet_note, pet_image, pet_image_type)
      res.status(201).json({ message: "Pet created successfully", data: result })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async getPet(req, res) {
    try {
      const { pet_id } = req.params

      if (!pet_id) {
        return res.status(400).json({ message: "Pet ID is required" })
      }

      const pet = await PetModel.getPetById(pet_id)

      if (!pet) {
        return res.status(404).json({ message: "Pet not found" })
      }

      res.status(200).json({ message: "Pet retrieved successfully", data: pet })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async getPetsByOwner(req, res) {
    try {
      const { owner_id } = req.params

      if (!owner_id) {
        return res.status(400).json({ message: "Owner ID is required" })
      }

      const pets = await PetModel.getPetsByOwner(owner_id)
      res.status(200).json({ message: "Pets retrieved successfully", data: pets })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async updatePet(req, res) {
    try {
      const { pet_id } = req.params
      const { pet_name, pet_type, pet_dob, pet_gender, pet_note } = req.body

      if (!pet_id) {
        return res.status(400).json({ message: "Pet ID is required" })
      }

      if (!pet_name || !pet_type || !pet_dob || !pet_gender) {
        return res.status(400).json({ message: "Required fields are missing" })
      }

      // Handle image file conversion to base64
      let pet_image = null
      let pet_image_type = null
      if (req.file) {
        const fileBuffer = req.file.buffer
        pet_image = fileBuffer.toString('base64')
        pet_image_type = req.file.mimetype
      }

      const result = await PetModel.updatePet(pet_id, pet_name, pet_type, pet_dob, pet_gender, pet_note, pet_image, pet_image_type)
      res.status(200).json({ message: "Pet updated successfully", data: result })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async deletePet(req, res) {
    try {
      const { pet_id } = req.params

      if (!pet_id) {
        return res.status(400).json({ message: "Pet ID is required" })
      }

      const result = await PetModel.deletePet(pet_id)
      res.status(200).json({ message: "Pet deleted successfully", data: result })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }
}
