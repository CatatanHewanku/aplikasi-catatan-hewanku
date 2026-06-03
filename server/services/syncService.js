import cron from 'node-cron'
import { VetClinicModel } from '../models/VetClinicModel.js'
import { searchVetClinicsGoogle, getBoundingBox } from './googlePlacesSearch.js'
import { cloudinary } from '../config/cloudinary.js'
import { Readable } from "stream"
import axios from "axios"

// Bekasi area only (using city name for geocoding)
const INDONESIAN_CITIES = [
  { name: 'Bekasi', country: 'West Java' }
]

// Cache metadata: stores which cities were synced and when
const cacheMetadata = new Map()

/**
 * Download photo from Google and upload to Cloudinary
 */
async function downloadAndUploadClinicPhoto(photoReference, clinicName) {
  try {
    if (!photoReference) return null

    const googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    
    const response = await axios.get(googlePhotoUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data)
    
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'catatanhewanku/vet-clinics',
          public_id: `${clinicName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50)}_${Date.now()}`,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      Readable.from([buffer]).pipe(uploadStream)
    })
    
    return cloudinaryResult.secure_url
  } catch (err) {
    console.error("Error downloading/uploading clinic photo:", err.message)
    return null
  }
}

/**
 * Auto-sync clinics from Google Places to database
 * Searches all major Indonesian cities and saves results
 */
export const syncClinicsFromGoogle = async () => {
  console.log('🔄 Starting Google Places auto-sync...')
  let totalClinicsSaved = 0
  let totalClinicsFailed = 0
  let totalPhotosUploaded = 0

  for (const city of INDONESIAN_CITIES) {
    try {
      console.log(`📍 Syncing ${city.name}...`)
      
      // Get city boundaries using geocoding
      const bounds = await getBoundingBox(city.name, city.country)
      if (!bounds) {
        console.log(`  Could not find boundaries for ${city.name}`)
        continue
      }

      console.log(`  Searching within bounds: ${JSON.stringify(bounds)}`)
      
      const clinics = await searchVetClinicsGoogle(bounds)

      if (!clinics || clinics.length === 0) {
        console.log(`  No clinics found in ${city.name}`)
        continue
      }

      // Save each clinic to database
      for (const clinic of clinics) {
        try {
          const exists = await VetClinicModel.clinicExistsByPlaceId(clinic.place_id)
          let clinicId = null

          if (exists) {
            // Update existing clinic with latest info from Google
            await VetClinicModel.updateClinicByPlaceId(
              clinic.place_id,
              clinic.clinic_name,
              clinic.clinic_address,
              clinic.clinic_latitude,
              clinic.clinic_longitude,
              clinic.phone,
              clinic.clinic_photo_reference
            )
            console.log(`  ✏️ Updated: ${clinic.clinic_name}`)
            
            // Get clinic_id for photo upload
            const existingClinics = await VetClinicModel.getAllClinics()
            clinicId = existingClinics.find(c => c.place_id === clinic.place_id)?.clinic_id
          } else {
            // Create new clinic
            const result = await VetClinicModel.createClinic(
              clinic.clinic_name,
              clinic.clinic_address,
              clinic.clinic_latitude,
              clinic.clinic_longitude,
              clinic.phone,
              clinic.place_id,
              clinic.clinic_photo_reference
            )
            clinicId = result.clinic_id
            totalClinicsSaved++
            console.log(`  ✅ Created: ${clinic.clinic_name}`)
          }

          // Download and upload photo to Cloudinary if photo reference exists
          if (clinic.clinic_photo_reference && clinicId) {
            console.log(`  📸 Uploading photo for ${clinic.clinic_name}...`)
            const cloudinaryUrl = await downloadAndUploadClinicPhoto(
              clinic.clinic_photo_reference,
              clinic.clinic_name
            )
            
            if (cloudinaryUrl) {
              await VetClinicModel.updateClinicPhotoUrl(clinicId, cloudinaryUrl)
              totalPhotosUploaded++
              console.log(`  ✅ Photo uploaded to Cloudinary for ${clinic.clinic_name}`)
            }
          }
        } catch (err) {
          console.error(`  Failed to save ${clinic.clinic_name}:`, err.message)
          totalClinicsFailed++
        }
      }

      // Mark city as synced
      cacheMetadata.set(city.name, {
        lastSync: new Date(),
        nextSync: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        clinicCount: clinics.length
      })

      console.log(`  ✅ ${city.name}: ${clinics.length} clinics processed`)
    } catch (err) {
      console.error(`❌ Error syncing ${city.name}:`, err.message)
      totalClinicsFailed++
    }
  }

  console.log(`
✅ Sync Complete!
   Saved: ${totalClinicsSaved} new clinics
   Photos uploaded: ${totalPhotosUploaded}
   Failed: ${totalClinicsFailed}
   Next sync: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleString()}
  `)

  return {
    saved: totalClinicsSaved,
    photos_uploaded: totalPhotosUploaded,
    failed: totalClinicsFailed,
    timestamp: new Date(),
    nextSync: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
}

/**
 * Check if cache needs refresh
 */
export const isCacheExpired = (cityName = null) => {
  if (!cityName) {
    for (const [city, meta] of cacheMetadata) {
      if (new Date() > meta.nextSync) {
        return true
      }
    }
    return false
  }

  const meta = cacheMetadata.get(cityName)
  if (!meta) return true

  return new Date() > meta.nextSync
}

/**
 * Get cache status for all cities
 */
export const getCacheStatus = () => {
  const status = {}
  for (const city of INDONESIAN_CITIES) {
    const meta = cacheMetadata.get(city.name)
    status[city.name] = {
      lastSync: meta?.lastSync?.toLocaleString() || 'Never',
      nextSync: meta?.nextSync?.toLocaleString() || 'Pending',
      isExpired: isCacheExpired(city.name),
      clinicCount: meta?.clinicCount || 0
    }
  }
  return status
}

/**
 * Setup cron job for automatic 30-day refresh
 */
export const setupSyncCron = () => {
  console.log('⏰ Setting up auto-sync cron job...')

  cron.schedule('0 2 1 * *', async () => {
    console.log('⏰ Cron triggered: Starting 30-day clinic data refresh')
    try {
      await syncClinicsFromGoogle()
    } catch (err) {
      console.error('❌ Cron sync failed:', err.message)
    }
  })

  console.log('✅ Cron job scheduled: Syncs every 30 days at 2 AM UTC')

  syncClinicsFromGoogle().catch(err => {
    console.error('❌ Initial sync failed:', err.message)
  })
}

/**
 * Manual trigger for sync
 */
export const manualSync = async () => {
  console.log('🔄 Manual sync triggered...')
  return await syncClinicsFromGoogle()
}
