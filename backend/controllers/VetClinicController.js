import { VetClinicModel } from "../models/VetClinicModel.js"
import { searchVetClinicsOSM } from "../osmSearch.js"
import { getQuotaInfo, getEstimatedCost } from "../googlePlacesSearch.js"
import { getCacheStatus, manualSync } from "../syncService.js"

// Helper: Generate Google Maps URL from place_id
const getGoogleMapsUrl = (placeId) => `https://www.google.com/maps/place/?q=place_id:${placeId}`

export class VetClinicController {
  static async createClinic(req, res) {
    try {
      const { clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_phone, place_id } = req.body

      if (!clinic_name || !clinic_address || !clinic_latitude || !clinic_longitude || !place_id) {
        return res.status(400).json({ message: "Required fields are missing" })
      }

      const result = await VetClinicModel.createClinic(clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_phone, place_id)
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

      // Add generated Google Maps URL
      clinic.google_map_url = getGoogleMapsUrl(clinic.place_id)

      res.status(200).json({ message: "Clinic retrieved successfully", data: clinic })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async getAllClinics(req, res) {
    try {
      const clinics = await VetClinicModel.getAllClinics()
      
      // Add generated Google Maps URLs
      clinics.forEach(clinic => {
        clinic.google_map_url = getGoogleMapsUrl(clinic.place_id)
      })

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
      
      // Add generated Google Maps URLs
      clinics.forEach(clinic => {
        clinic.google_map_url = getGoogleMapsUrl(clinic.place_id)
      })

      res.status(200).json({ message: "Clinics searched successfully", data: clinics })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async updateClinic(req, res) {
    try {
      const { clinic_id } = req.params
      const { clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_phone } = req.body

      if (!clinic_id) {
        return res.status(400).json({ message: "Clinic ID is required" })
      }

      if (!clinic_name || !clinic_address || !clinic_latitude || !clinic_longitude) {
        return res.status(400).json({ message: "Required fields are missing" })
      }

      const result = await VetClinicModel.updateClinic(clinic_id, clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_phone)
      res.status(200).json({ message: "Clinic updated successfully", data: result })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async searchOSMClinics(req, res) {
    try {
      const { latitude, longitude, radius = 5 } = req.body

      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" })
      }

      const clinics = await searchVetClinicsOSM(latitude, longitude, radius)

      res.status(200).json({
        message: "Clinics found from OpenStreetMap",
        data: clinics,
        attribution: "Map data © OpenStreetMap contributors (ODbL License)"
      })
    } catch (err) {
      console.error("OSM Search Error:", err)
      res.status(500).json({ message: err.message })
    }
  }

  static async saveOSMClinic(req, res) {
    try {
      const { clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_phone, clinic_photo_url, place_id } = req.body

      if (!clinic_name || !clinic_address || !clinic_latitude || !clinic_longitude || !place_id) {
        return res.status(400).json({ message: "Required fields are missing" })
      }

      const existingClinics = await VetClinicModel.getAllClinics()
      const exists = existingClinics.some(c => c.place_id === place_id)

      if (exists) {
        return res.status(409).json({ message: "Clinic already saved" })
      }

      const result = await VetClinicModel.createClinic(
        clinic_name,
        clinic_address,
        clinic_latitude,
        clinic_longitude,
        clinic_phone,
        place_id,
        clinic_photo_url
      )

      res.status(201).json({
        message: "Clinic saved successfully",
        data: result,
        attribution: "Data sourced from OpenStreetMap contributors (ODbL License)"
      })
    } catch (err) {
      console.error("Save Clinic Error:", err)
      res.status(500).json({ message: err.message })
    }
  }

  static async getQuota(req, res) {
    try {
      const quota = getQuotaInfo()
      const costEstimate = getEstimatedCost()
      const cacheStatus = getCacheStatus()

      res.status(200).json({
        message: "Quota and cache information",
        quota: quota,
        cost_estimate: costEstimate,
        cache_status: cacheStatus
      })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async manualSyncGoogle(req, res) {
    try {
      console.log('Manual sync triggered by user')
      const result = await manualSync()

      res.status(200).json({
        message: "Manual sync completed",
        data: result,
        note: "All clinics have been refreshed from Google Places. Database is now current."
      })
    } catch (err) {
      console.error("Manual sync error:", err)
      res.status(500).json({ message: err.message })
    }
  }
}
