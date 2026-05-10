import axios from 'axios'

/**
 * Search for veterinary clinics using OpenStreetMap Overpass API
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} radius - Search radius in km (default 5)
 * @returns {Array} Array of clinic objects
 */
export const searchVetClinicsOSM = async (latitude, longitude, radiusKm = 5) => {
  try {
    const radiusDegrees = radiusKm / 111

    const query = `
      [out:json][timeout:10];
      (
        node["amenity"="veterinary"](${latitude - radiusDegrees},${longitude - radiusDegrees},${latitude + radiusDegrees},${longitude + radiusDegrees});
        way["amenity"="veterinary"](${latitude - radiusDegrees},${longitude - radiusDegrees},${latitude + radiusDegrees},${longitude + radiusDegrees});
        relation["amenity"="veterinary"](${latitude - radiusDegrees},${longitude - radiusDegrees},${latitude + radiusDegrees},${longitude + radiusDegrees});
      );
      out center;
    `

    console.log(`Searching OSM for vet clinics near ${latitude}, ${longitude}`)

    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      query,
      {
        headers: {
          'Content-Type': 'application/osm3s',
          'User-Agent': 'CatatanHewanku/1.0'
        },
        timeout: 15000
      }
    )

    if (!response.data.elements) {
      console.log('No elements found from OSM')
      return []
    }

    const clinics = response.data.elements
      .filter((element) => element.lat && element.lon)
      .map((element) => {
        const lat = element.lat || element.center?.lat
        const lon = element.lon || element.center?.lon

        return {
          clinic_name: element.tags?.name || 'Veterinary Clinic',
          clinic_address:
            element.tags?.['addr:street'] ||
            element.tags?.['addr:full'] ||
            'Address not available',
          clinic_latitude: lat,
          clinic_longitude: lon,
          clinic_status: 'open',
          google_map_url: `https://maps.google.com/?q=${lat},${lon}`,
          osm_map_url: `https://www.openstreetmap.org/?lat=${lat}&lon=${lon}&zoom=15`,
          place_id: `osm_${element.id}`,
          phone: element.tags?.phone || null,
          website: element.tags?.website || null,
          email: element.tags?.email || null
        }
      })

    console.log(`Found ${clinics.length} vet clinics from OSM`)
    return clinics
  } catch (err) {
    console.error('OSM search error:', err.message)
    throw new Error(`Failed to search OpenStreetMap: ${err.message}`)
  }
}
