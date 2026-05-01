import { VetClinicModel } from "../models/VetClinicModel.js"

export class VetClinicController {
  static async createClinic(req, res) {
    try {
      const { clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_status, google_map_url, place_id } = req.body

      if (!clinic_name || !clinic_address || !clinic_latitude || !clinic_longitude || !clinic_status || !place_id) {
        return res.status(400).json({ message: "Required fields are missing" })
      }

      const result = await VetClinicModel.createClinic(clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_status, google_map_url, place_id)
      res.status(201).json({ message: "Clinic created successfully", data: result })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async getClinic(req, res) {
    try {
      const { clinic_id } = req.params

      if (!clinic_id) {
        return res.status(400).json({ message: "Clinic ID is required" })
      }

      const clinic = await VetClinicModel.getClinicById(clinic_id)

      if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" })
      }

      res.status(200).json({ message: "Clinic retrieved successfully", data: clinic })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async getAllClinics(req, res) {
    try {
      const clinics = await VetClinicModel.getAllClinics()
      res.status(200).json({ message: "Clinics retrieved successfully", data: clinics })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async searchClinics(req, res) {
    try {
      const { search_term } = req.query

      if (!search_term) {
        return res.status(400).json({ message: "Search term is required" })
      }

      const clinics = await VetClinicModel.searchClinics(search_term)
      res.status(200).json({ message: "Clinics searched successfully", data: clinics })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async updateClinic(req, res) {
    try {
      const { clinic_id } = req.params
      const { clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_status, google_map_url } = req.body

      if (!clinic_id) {
        return res.status(400).json({ message: "Clinic ID is required" })
      }

      if (!clinic_name || !clinic_address || !clinic_latitude || !clinic_longitude || !clinic_status) {
        return res.status(400).json({ message: "Required fields are missing" })
      }

      const result = await VetClinicModel.updateClinic(clinic_id, clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_status, google_map_url)
      res.status(200).json({ message: "Clinic updated successfully", data: result })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }
}
