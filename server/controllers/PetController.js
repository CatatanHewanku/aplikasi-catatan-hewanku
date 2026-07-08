import { PetModel } from "../models/PetModel.js"
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js"
import { Readable } from "stream"

export class PetController {
  static async createPet(req, res) {
    try {
      const { owner_id, pet_name, pet_type, pet_dob, pet_gender, pet_note } = req.body

      if (!owner_id || !pet_name || !pet_type || !pet_dob || !pet_gender) {
        return res.status(400).json({ message: "Required fields are missing" })
      }

      let pet_image_url = null
      if (req.file) {
        try {
          const result = await uploadToCloudinary(req.file, 'catatanhewanku/pets')
          pet_image_url = result.secure_url
        } catch (err) {
          return res.status(500).json({ message: `Image upload failed: ${err.message}` })
        }
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
      const { owner_id } = req.user

      if (!pet_id) {
        return res.status(400).json({ message: "Pet ID is required" })
      }

      const pet = await PetModel.getPetById(pet_id, owner_id)

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
      const { owner_id } = req.user

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
      const { owner_id } = req.user
      const { pet_name, pet_type, pet_dob, pet_gender, pet_note } = req.body
      const file = req.file

      if (!pet_id) return res.status(400).json({ message: "Pet ID is required" })
      if (!pet_name || !pet_type || !pet_dob || !pet_gender) {
        return res.status(400).json({ message: "Required fields are missing" })
      }

      const existingPet = await PetModel.getPetById(pet_id, owner_id)
      if (!existingPet) return res.status(404).json({ message: "Pet not found" })

      let pet_image_url = existingPet.pet_image

      if (file) {
        try {
          if (existingPet.pet_image) {
            await deleteFromCloudinary(existingPet.pet_image);
          }
          const result = await uploadToCloudinary(file, 'catatanhewanku/pets')
          pet_image_url = result.secure_url
        } catch (err) {
          return res.status(500).json({ message: `Image upload failed: ${err.message}` })
        }
      }

      const petData = await PetModel.updatePet(pet_id, owner_id, pet_name, pet_type, pet_dob, pet_gender, pet_note, pet_image_url)
      res.status(200).json({ message: "Pet updated successfully", data: petData })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async deletePet(req, res) {
    try {
      const { pet_id } = req.params
      const { owner_id } = req.user

      if (!pet_id) return res.status(400).json({ message: "Pet ID is required" })

      const existingPet = await PetModel.getPetById(pet_id, owner_id)
      if (!existingPet) return res.status(404).json({ message: "Pet not found" })

      if (existingPet.pet_image) {
        await deleteFromCloudinary(existingPet.pet_image);
      }

      const { MedicalRecordModel } = await import("../models/MedicalRecordModel.js");
      const medicalRecords = await MedicalRecordModel.getRecordsByPetId(pet_id);
      
      for (const record of medicalRecords) {
        if (record.record_image) {
          await deleteFromCloudinary(record.record_image);
        }
      }

      const result = await PetModel.deletePet(pet_id, owner_id)
      res.status(200).json({ message: "Pet deleted successfully", data: result })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }
}
