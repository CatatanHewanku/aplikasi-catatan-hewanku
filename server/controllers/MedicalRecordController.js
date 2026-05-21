import { MedicalRecordModel } from "../models/MedicalRecordModel.js"
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js"

const VALID_CONSULTATION_TYPES = [
  'Vaccination',
  'General Check Up',
  'Dental Care',
  'Parasite Control',
  'Nutrition',
  'Illness/Treatment',
  'Surgery',
  'Prescription Refill',
  'Follow-up',
  'Emergency'
]

export class MedicalRecordController {
  static async createRecord(req, res) {
    try {
      const { pet_id, record_visit_date, record_consultation_type, record_vet_name, record_vet_clinic_name, record_pet_weight, record_pet_temperature, record_note } = req.body
      const file = req.file

      // Validate required fields
      if (!pet_id || !record_visit_date || !record_consultation_type || !record_vet_name || !record_vet_clinic_name || record_pet_weight === undefined || record_pet_temperature === undefined) {
        return res.status(400).json({ message: "Missing required fields" })
      }

      // Validate consultation type
      if (!VALID_CONSULTATION_TYPES.includes(record_consultation_type)) {
        return res.status(400).json({ message: `Invalid consultation type. Allowed: ${VALID_CONSULTATION_TYPES.join(', ')}` })
      }

      // Check if pet exists
      const petExists = await MedicalRecordModel.petExists(pet_id)
      if (!petExists) {
        return res.status(404).json({ message: "Pet not found" })
      }

      // Check visit date is not in future
      const visitDate = new Date(record_visit_date)
      if (visitDate > new Date()) {
        return res.status(400).json({ message: "Visit date cannot be in the future" })
      }

      // Upload image to Cloudinary if provided
      let imageUrl = null
      if (file) {
        try {
          const result = await uploadToCloudinary(file, 'catatanhewanku/medical-records')
          imageUrl = result.secure_url
        } catch (err) {
          return res.status(500).json({ message: `Image upload failed: ${err.message}` })
        }
      }

      const result = await MedicalRecordModel.createRecord(
        pet_id,
        visitDate,
        record_consultation_type,
        record_vet_name,
        record_vet_clinic_name,
        parseFloat(record_pet_weight),
        parseFloat(record_pet_temperature),
        record_note || null,
        imageUrl
      )

      res.status(201).json({
        message: "Medical record created successfully",
        data: result
      })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async getRecord(req, res) {
    try {
      const { record_id } = req.params

      if (!record_id) {
        return res.status(400).json({ message: "Record ID is required" })
      }

      const record = await MedicalRecordModel.getRecordById(record_id)

      if (!record) {
        return res.status(404).json({ message: "Medical record not found" })
      }

      res.status(200).json({
        message: "Medical record retrieved successfully",
        data: record
      })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async getRecordsByPet(req, res) {
    try {
      const { pet_id } = req.params

      if (!pet_id) {
        return res.status(400).json({ message: "Pet ID is required" })
      }

      const petExists = await MedicalRecordModel.petExists(pet_id)
      if (!petExists) {
        return res.status(404).json({ message: "Pet not found" })
      }

      const records = await MedicalRecordModel.getRecordsByPetId(pet_id)

      res.status(200).json({
        message: "Medical records retrieved successfully",
        data: records,
        count: records.length
      })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async getAllRecords(req, res) {
    try {
      const records = await MedicalRecordModel.getAllRecords()

      res.status(200).json({
        message: "All medical records retrieved successfully",
        data: records,
        count: records.length
      })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async updateRecord(req, res) {
    try {
      const { record_id } = req.params
      const { record_visit_date, record_consultation_type, record_vet_name, record_vet_clinic_name, record_pet_weight, record_pet_temperature, record_note } = req.body
      const file = req.file

      if (!record_id) {
        return res.status(400).json({ message: "Record ID is required" })
      }

      // Validate required fields
      if (!record_visit_date || !record_consultation_type || !record_vet_name || !record_vet_clinic_name || record_pet_weight === undefined || record_pet_temperature === undefined) {
        return res.status(400).json({ message: "Missing required fields" })
      }

      // Validate consultation type
      if (!VALID_CONSULTATION_TYPES.includes(record_consultation_type)) {
        return res.status(400).json({ message: `Invalid consultation type. Allowed: ${VALID_CONSULTATION_TYPES.join(', ')}` })
      }

      // Check visit date is not in future
      const visitDate = new Date(record_visit_date)
      if (visitDate > new Date()) {
        return res.status(400).json({ message: "Visit date cannot be in the future" })
      }

      // Get existing record
      const existingRecord = await MedicalRecordModel.getRecordById(record_id)
      if (!existingRecord) {
        return res.status(404).json({ message: "Medical record not found" })
      }

      // Handle image update
      let imageUrl = existingRecord.record_image
      if (file) {
        try {
          if (existingRecord.record_image) {
            await deleteFromCloudinary(existingRecord.record_image);
          }
          const result = await uploadToCloudinary(file, 'catatanhewanku/medical-records')
          imageUrl = result.secure_url
        } catch (err) {
          return res.status(500).json({ message: `Image upload failed: ${err.message}` })
        }
      }

      const result = await MedicalRecordModel.updateRecord(
        record_id,
        visitDate,
        record_consultation_type,
        record_vet_name,
        record_vet_clinic_name,
        parseFloat(record_pet_weight),
        parseFloat(record_pet_temperature),
        record_note || null,
        imageUrl
      )

      res.status(200).json({
        message: "Medical record updated successfully",
        data: result
      })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async deleteRecord(req, res) {
    try {
      const { record_id } = req.params

      if (!record_id) return res.status(400).json({ message: "Record ID is required" })

      const existingRecord = await MedicalRecordModel.getRecordById(record_id)
      if (!existingRecord) return res.status(404).json({ message: "Medical record not found" })
      
      // Delete image if exists
      if (existingRecord.record_image) {
        await deleteFromCloudinary(existingRecord.record_image);
      }

      const result = await MedicalRecordModel.deleteRecord(record_id)
      res.status(200).json({ message: "Medical record deleted successfully", data: result })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }
}
