import { VetClinicModel } from "../models/VetClinicModel.js"
import { getQuotaInfo, getEstimatedCost } from "../services/googlePlacesSearch.js"
import { getCacheStatus, manualSync } from "../services/syncService.js"
import { uploadToCloudinary, cloudinary } from "../config/cloudinary.js"
import { Readable } from "stream"
import axios from "axios"

const getGoogleMapsUrl = (placeId) => `https://www.google.com/maps/place/?q=place_id:${placeId}`

async function downloadAndUploadClinicPhoto(photoReference, clinicName) {
  try {
    if (!photoReference) return null;

    const googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
    
    const response = await axios.get(googlePhotoUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'catatanhewanku/vet-clinics',
          public_id: `${clinicName.replace(/\s+/g, '_')}_${Date.now()}`,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      Readable.from([buffer]).pipe(uploadStream);
    });
    
    return cloudinaryResult.secure_url;
  } catch (err) {
    console.error("Error downloading/uploading clinic photo:", err);
    return null;
  }
}

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

      clinic.google_map_url = getGoogleMapsUrl(clinic.place_id)

      res.status(200).json({ message: "Clinic retrieved successfully", data: clinic })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async getAllClinics(req, res) {
    try {
      const clinics = await VetClinicModel.getAllClinics()
      
      for (const clinic of clinics) {
        clinic.google_map_url = getGoogleMapsUrl(clinic.place_id);
        
        if (!clinic.clinic_photo_cloudinary_url && clinic.clinic_photo_reference) {
          const cloudinaryUrl = await downloadAndUploadClinicPhoto(
            clinic.clinic_photo_reference,
            clinic.clinic_name
          );
          
          if (cloudinaryUrl) {
            await VetClinicModel.updateClinicPhotoUrl(clinic.clinic_id, cloudinaryUrl);
            clinic.clinic_photo_cloudinary_url = cloudinaryUrl;
          }
        }
      }

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
