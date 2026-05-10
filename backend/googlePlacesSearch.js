import axios from 'axios'

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY
const BASE_URL = 'https://maps.googleapis.com/maps/api/place'
const GEOCODING_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode'

// Rate limiting tracker (in-memory, resets daily)
let dailyRequestCount = 0
let lastResetDate = new Date().toDateString()
const DAILY_LIMIT = 200 // Conservative limit for free trial ($1.40/day cost)

// Request queue for rate limiting
let requestQueue = []
let lastRequestTime = 0
const MIN_DELAY_MS = 100 // Minimum 100ms between requests

/**
 * Get bounding box for a city using Geocoding API
 * @param {string} cityName - City name (e.g., 'Bekasi')
 * @param {string} country - Country name (e.g., 'Indonesia')
 * @returns {Object} Bounding box with northeast and southwest coordinates
 */
export const getBoundingBox = async (cityName, country) => {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('GOOGLE_PLACES_API_KEY not set in environment variables')
    }

    console.log(`🔑 Using API Key: ${GOOGLE_PLACES_API_KEY.substring(0, 10)}...`)

    await applyRateLimit()

    const url = `${GEOCODING_BASE_URL}/json`
    const params = {
      address: `${cityName}, ${country}`,
      key: GOOGLE_PLACES_API_KEY
    }

    console.log(`📍 Geocoding: ${cityName}, ${country}`)
    console.log(`🌐 Request URL: ${url}`)

    const response = await axios.get(url, { params })
    
    console.log(`📨 Response Status: ${response.data.status}`)
    console.log(`📋 Full Response:`, response.data)

    if (response.data.status !== 'OK') {
      throw new Error(`Geocoding error: ${response.data.status}`)
    }

    const geometry = response.data.results[0]?.geometry
    if (!geometry || !geometry.bounds) {
      console.log(`Warning: No bounds found for ${cityName}, using viewport instead`)
      return geometry.viewport // Fallback to viewport if bounds not available
    }

    return geometry.bounds
  } catch (err) {
    console.error('Geocoding search error:', err.message)
    throw err
  }
}

/**
 * Reset daily counter at midnight
 */
function checkDailyReset() {
  const today = new Date().toDateString()
  if (today !== lastResetDate) {
    dailyRequestCount = 0
    lastResetDate = today
    console.log('Daily API quota reset')
  }
}

/**
 * Apply rate limiting before making request
 */
async function applyRateLimit() {
  checkDailyReset()

  if (dailyRequestCount >= DAILY_LIMIT) {
    throw new Error(`Daily API limit reached (${DAILY_LIMIT} requests). Try again tomorrow.`)
  }

  // Throttle requests: ensure min delay between requests
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < MIN_DELAY_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_DELAY_MS - timeSinceLastRequest))
  }
  lastRequestTime = Date.now()
  dailyRequestCount++

  console.log(`API Request ${dailyRequestCount}/${DAILY_LIMIT} today`)
}

/**
 * Search for veterinary clinics within a bounding box
 * @param {Object} bounds - Bounding box with northeast and southwest coordinates
 * @returns {Array} Array of clinic objects
 */
export const searchVetClinicsGoogle = async (bounds) => {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('GOOGLE_PLACES_API_KEY not set in environment variables')
    }

    // If bounds is provided, use it; otherwise fall back to center + radius
    if (!bounds || typeof bounds !== 'object') {
      throw new Error('Valid bounds object required (use getBoundingBox() first)')
    }

    // Get center of bounds for search
    const centerLat = (bounds.northeast.lat + bounds.southwest.lat) / 2
    const centerLon = (bounds.northeast.lng + bounds.southwest.lng) / 2

    // Calculate approximate radius from bounds
    const deltaLat = bounds.northeast.lat - bounds.southwest.lat
    const radiusMeters = (deltaLat / 2) * 111000 // Rough conversion: 1 degree ≈ 111km

    await applyRateLimit()

    const url = `${BASE_URL}/nearbysearch/json`
    const params = {
      location: `${centerLat},${centerLon}`,
      radius: radiusMeters,
      keyword: 'veterinary clinic',
      type: 'veterinary_care',
      key: GOOGLE_PLACES_API_KEY
    }

    console.log(`Searching Google Places for vet clinics in bounds`)

    const response = await axios.get(url, { params })

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${response.data.status} - ${response.data.error_message || ''}`)
    }

    if (response.data.status === 'ZERO_RESULTS') {
      console.log('No vet clinics found')
      return []
    }

    // Transform Google data to our format
    let allClinics = response.data.results.map((place) => {
      // Get first photo URL (if available)
      let photoUrl = null
      if (place.photos && place.photos.length > 0) {
        const photoReference = place.photos[0].photo_reference
        photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`
      }

      return {
        clinic_name: place.name,
        clinic_address: place.vicinity || place.formatted_address || 'Address not available',
        clinic_latitude: place.geometry.location.lat,
        clinic_longitude: place.geometry.location.lng,
        place_id: place.place_id,
        clinic_photo_url: photoUrl,
        phone: place.formatted_phone_number || place.international_phone_number || null,
        website: place.website || null,
        email: null,
        rating: place.rating || null,
        review_count: place.user_ratings_total || 0
      }
    })

    // Handle pagination - Google returns up to 20 results per page
    let nextPageToken = response.data.next_page_token
    let pageCount = 1

    while (nextPageToken) {
      // Must wait before using next_page_token (Google requirement)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      await applyRateLimit()

      const nextParams = {
        ...params,
        pagetoken: nextPageToken
      }

      const nextResponse = await axios.get(url, { params: nextParams })

      if (nextResponse.data.status === 'OK') {
        const nextClinics = nextResponse.data.results.map((place) => {
          // Get first photo URL (if available)
          let photoUrl = null
          if (place.photos && place.photos.length > 0) {
            const photoReference = place.photos[0].photo_reference
            photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`
          }

          return {
            clinic_name: place.name,
            clinic_address: place.vicinity || place.formatted_address || 'Address not available',
            clinic_latitude: place.geometry.location.lat,
            clinic_longitude: place.geometry.location.lng,
            place_id: place.place_id,
            clinic_photo_url: photoUrl,
            phone: place.formatted_phone_number || place.international_phone_number || null,
            website: place.website || null,
            email: null,
            rating: place.rating || null,
            review_count: place.user_ratings_total || 0
          }
        })

        allClinics = [...allClinics, ...nextClinics]
        nextPageToken = nextResponse.data.next_page_token
        pageCount++
        console.log(`  Page ${pageCount}: Found ${nextClinics.length} more clinics`)
      } else {
        nextPageToken = null
      }
    }

    console.log(`Found ${allClinics.length} vet clinics from Google Places (${pageCount} pages)`)
    return allClinics
  } catch (err) {
    console.error('Google Places search error:', err.message)
    throw err
  }
}

/**
 * Get detailed clinic information
 * @param {string} placeId - Google Place ID
 * @returns {Object} Detailed clinic information
 */
export const getClinicDetailsGoogle = async (placeId) => {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('GOOGLE_PLACES_API_KEY not set in environment variables')
    }

    await applyRateLimit()

    const url = `${BASE_URL}/details/json`
    const params = {
      place_id: placeId,
      fields: 'name,formatted_address,geometry,formatted_phone_number,website,opening_hours,rating,review,url',
      key: GOOGLE_PLACES_API_KEY
    }

    const response = await axios.get(url, { params })

    if (response.data.status !== 'OK') {
      throw new Error(`Google Places API error: ${response.data.status}`)
    }

    return response.data.result
  } catch (err) {
    console.error('Google Places detail error:', err.message)
    throw err
  }
}

/**
 * Get remaining quota info
 */
export const getQuotaInfo = () => {
  checkDailyReset()
  return {
    daily_limit: DAILY_LIMIT,
    requests_today: dailyRequestCount,
    remaining: DAILY_LIMIT - dailyRequestCount,
    last_reset: lastResetDate,
    estimated_daily_cost: `$${(dailyRequestCount * 7 / 1000).toFixed(2)}`
  }
}

/**
 * Get estimated monthly cost based on daily usage
 */
export const getEstimatedCost = () => {
  checkDailyReset()
  const estimatedMonthlyRequests = dailyRequestCount * 30
  const estimatedMonthlyCost = (estimatedMonthlyRequests * 7) / 1000
  return {
    daily_requests: dailyRequestCount,
    estimated_monthly_requests: estimatedMonthlyRequests,
    estimated_monthly_cost: `$${estimatedMonthlyCost.toFixed(2)}`,
    free_trial_quota: '43,000 requests ($300 credit)',
    days_until_free_trial_exhausted: estimatedMonthlyRequests > 0 ? Math.floor(43000 / dailyRequestCount) : 'unlimited'
  }
}
