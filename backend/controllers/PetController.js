import { PetModel } from "../models/PetModel.js"
import { cloudinary } from "../config/cloudinary.js"
import { Readable } from "stream"

export class PetController {
  static async createPet(req, res) {
    try {
      const { owner_id, pet_name, pet_type, pet_dob, pet_gender, pet_note } = req.body

      if (!owner_id || !pet_name || !pet_type || !pet_dob || !pet_gender) {
        return res.status(400).json({ message: "Required fields are missing" })
      }

      // Handle image file upload to Cloudinary
      let pet_image_url = null
      if (req.file) {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'pets/profile', resource_type: 'auto' },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          )
          Readable.from(req.file.buffer).pipe(uploadStream)
        })
        pet_image_url = uploadResult.secure_url
      }

      const petData = await PetModel.createPet(owner_id, pet_name, pet_type, pet_dob, pet_gender, pet_note, pet_image_url)
      res.status(201).json({ message: "Pet created successfully", data: petData })
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

      let pet_image_url = null
      if (req.file) {
        // Get existing pet to delete old image if it exists
        const existingPet = await PetModel.getPetById(pet_id)
        if (existingPet && existingPet.pet_image) {
          const publicId = existingPet.pet_image.split('/').pop().split('.')[0]
          await cloudinary.uploader.destroy(`pets/profile/${publicId}`)
        }

        // Upload new image
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'pets/profile', resource_type: 'auto' },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          )
          Readable.from(req.file.buffer).pipe(uploadStream)
        })
        pet_image_url = uploadResult.secure_url
      }

      const petData = await PetModel.updatePet(pet_id, pet_name, pet_type, pet_dob, pet_gender, pet_note, pet_image_url)
      res.status(200).json({ message: "Pet updated successfully", data: petData })
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
