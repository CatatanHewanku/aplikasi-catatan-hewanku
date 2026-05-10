import cron from 'node-cron'
import { VetClinicModel } from './models/VetClinicModel.js'
import { searchVetClinicsGoogle, getBoundingBox } from './googlePlacesSearch.js'

// Bekasi area only (using city name for geocoding)
const INDONESIAN_CITIES = [
  { name: 'Bekasi', country: 'Indonesia' }
]

// Cache metadata: stores which cities were synced and when
const cacheMetadata = new Map()

/**
 * Auto-sync clinics from Google Places to database
 * Searches all major Indonesian cities and saves results
 */
export const syncClinicsFromGoogle = async () => {
  console.log('🔄 Starting Google Places auto-sync...')
  let totalClinicsSaved = 0
  let totalClinicsFailed = 0

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

          if (exists) {
            // Update existing clinic with latest info from Google
            await VetClinicModel.updateClinicByPlaceId(
              clinic.place_id,
              clinic.clinic_name,
              clinic.clinic_address,
              clinic.clinic_latitude,
              clinic.clinic_longitude,
              clinic.phone,
              clinic.clinic_photo_url
            )
            console.log(`  ✏️ Updated: ${clinic.clinic_name}`)
          } else {
            // Create new clinic
            await VetClinicModel.createClinic(
              clinic.clinic_name,
              clinic.clinic_address,
              clinic.clinic_latitude,
              clinic.clinic_longitude,
              clinic.phone,
              clinic.place_id,
              clinic.clinic_photo_url
            )
            totalClinicsSaved++
            console.log(`  ✅ Created: ${clinic.clinic_name}`)
          }
        } catch (err) {
          console.error(`  Failed to save ${clinic.clinic_name}:`, err.message)
          totalClinicsFailed++
        }
      }

      // Mark city as synced
      cacheMetadata.set(city.name, {
        lastSync: new Date(),
        nextSync: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
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
   Failed: ${totalClinicsFailed}
   Next sync: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleString()}
  `)

  return {
    saved: totalClinicsSaved,
    failed: totalClinicsFailed,
    timestamp: new Date(),
    nextSync: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
}

/**
 * Check if cache needs refresh
 * @param {string} cityName - City name to check
 * @returns {boolean} True if needs refresh
 */
export const isCacheExpired = (cityName = null) => {
  if (!cityName) {
    // Check if ANY city cache is expired
    for (const [city, meta] of cacheMetadata) {
      if (new Date() > meta.nextSync) {
        return true
      }
    }
    return false
  }

  const meta = cacheMetadata.get(cityName)
  if (!meta) return true // Never synced = expired

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
 * Runs at 2 AM UTC (9 AM Jakarta time) every 30 days
 */
export const setupSyncCron = () => {
  console.log('⏰ Setting up auto-sync cron job...')

  // Run every 30 days at 2 AM UTC
  cron.schedule('0 2 1 * *', async () => {
    console.log('⏰ Cron triggered: Starting 30-day clinic data refresh')
    try {
      await syncClinicsFromGoogle()
    } catch (err) {
      console.error('❌ Cron sync failed:', err.message)
    }
  })

  console.log('✅ Cron job scheduled: Syncs every 30 days at 2 AM UTC')

  // Optional: Also sync on first startup (comment out if you prefer manual)
  syncClinicsFromGoogle().catch(err => {
    console.error('❌ Initial sync failed:', err.message)
  })
}

/**
 * Manual trigger for sync (useful for testing)
 */
export const manualSync = async () => {
  console.log('🔄 Manual sync triggered...')
  return await syncClinicsFromGoogle()
}
