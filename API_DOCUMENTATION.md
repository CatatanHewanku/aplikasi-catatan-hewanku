# CatatanHewanku - Backend API Documentation

## Overview
Complete backend API for pet tracking application with integrated vet clinic search, device-based authentication, and auto-cached clinic data.

---

## Models

### OwnerModel.js
Database operations for pet owners with device-based session management.
- `createOwner()`, `getOwnerById()`, `getOwnerByEmailOrPhone()`, `getAllOwners()`, `updateOwner()`, `deleteOwner()`
- `createDeviceSession()`, `getActiveDeviceSession()`, `deleteDeviceSession()`

### PetModel.js
Database operations for pets with Cloudinary image support.
- `createPet()`, `getPetById()`, `getPetsByOwner()`, `updatePet()`, `deletePet()`
- Pet images stored as Cloudinary URLs

### VetClinicModel.js
Database operations for vet clinics with photo URLs.
- `createClinic()`, `getClinicById()`, `getAllClinics()`, `searchClinics()`, `updateClinic()`
- `updateClinicByPlaceId()`, `clinicExistsByPlaceId()`
- Includes clinic photos from Google Places

---

## API Endpoints

### Authentication (Device-Based)
- `POST /api/auth/login` - Login with email OR phone (returns device_id)
- `POST /api/auth/logout` - Logout (deactivates device session)

### Owner Endpoints
- `POST /api/owners` - Create new owner
- `GET /api/owners` - Get all owners
- `GET /api/owners/:owner_id` - Get specific owner
- `PATCH /api/owners/:owner_id` - Update owner
- `DELETE /api/owners/:owner_id` - Delete owner

### Pet Endpoints
- `POST /api/pets` - Create new pet (with Cloudinary image upload)
- `GET /api/pets/owner/:owner_id` - Get all pets by owner
- `GET /api/pets/:pet_id` - Get specific pet
- `PATCH /api/pets/:pet_id` - Update pet
- `DELETE /api/pets/:pet_id` - Delete pet

### Vet Clinic Endpoints
- `GET /api/vetclinics` - Get all clinics (includes `clinic_photo_url`)
- `GET /api/vetclinics/:clinic_id` - Get specific clinic
- `GET /api/vetclinics/search?search_term=xyz` - Search clinics by name/address
- `POST /api/vetclinics` - Manually create clinic
- `PATCH /api/vetclinics/:clinic_id` - Update clinic
- `POST /api/vetclinics/search/osm` - Search OpenStreetMap (fallback)
- `POST /api/vetclinics/save/osm` - Save OSM clinic to database
- `GET /api/vetclinics/quota/info` - Check Google API quota usage
- `POST /api/vetclinics/sync/manual` - Trigger manual sync

### Medical Records Endpoints
- `POST /api/medical-records` - Create new medical record (with image upload)
- `GET /api/medical-records` - Get all medical records
- `GET /api/medical-records/:record_id` - Get specific record
- `GET /api/medical-records/pet/:pet_id` - Get all records for a pet
- `PATCH /api/medical-records/:record_id` - Update medical record
- `DELETE /api/medical-records/:record_id` - Delete medical record (soft delete)

---

## Key Features

### 🔐 Device-Based Authentication
- One user per device (prevents account takeover on shared devices)
- Login accepts email OR phone in same field
- `device_id` tracks sessions

### 🖼️ Pet Images (Cloudinary)
- Images uploaded to Cloudinary cloud storage
- URL stored in database
- Automatic optimization & CDN delivery

### 🏥 Medical Records
- Per-pet medical history tracking
- Single Cloudinary image per visit
- Mandatory fields: visit date, consultation type, vet name, clinic name, weight, temperature
- Optional: notes and images
- Future dates prevented via database constraint
- Soft delete for audit trail
- Consultation types: Vaccination, Checkup, Illness/Treatment, Surgery, Prescription Refill, Follow-up, Dental Care, Emergency, Consultation

### 📍 Vet Clinic Management
**Auto-Cache System (30-day refresh):**
- Monthly cron job searches Bekasi area via Google Places API
- Stores results in database
- Frontend serves from cache (no per-search API calls)
- **Cost**: ~$0.15/month vs $7/month without caching

**Search Strategy:**
- Uses Geocoding API to get city boundaries
- Searches within exact administrative bounds (not radius)
- Returns paginated results (up to 60 clinics per city)

**Data Sync on Refresh:**
- Existing clinics (by place_id): Updated with latest info from Google
- New clinics: Created fresh
- Manually added clinics: Preserved if place_id doesn't match Google data
- Includes clinic photos from Google Places

**Fallback:**
- OpenStreetMap search available if Google API unavailable

---

## Clinic Response Example

```json
{
  "clinic_id": 1,
  "clinic_name": "Pet Care Bekasi",
  "clinic_address": "Jl. Merdeka No. 123, Bekasi",
  "clinic_latitude": -6.235,
  "clinic_longitude": 106.985,
  "clinic_phone": "021-8234567",
  "clinic_photo_url": "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=...",
  "place_id": "ChIJ...",
  "google_map_url": "https://www.google.com/maps/place/?q=place_id:ChIJ...",
  "created_at": "2026-05-10T00:00:00Z"
}
```

---

## Medical Record Response Example

```json
{
  "record_id": 1,
  "pet_id": 1,
  "record_visit_date": "2026-05-08T10:30:00Z",
  "record_consultation_type": "Vaccination",
  "record_vet_name": "Dr. Budi",
  "record_vet_clinic_name": "Pet Care Bekasi",
  "record_pet_weight": 4.5,
  "record_pet_temperature": 38.5,
  "record_note": "Rabies booster vaccination given. Pet in good health.",
  "record_image": "https://res.cloudinary.com/your-cloud/image/upload/...",
  "created_at": "2026-05-09T00:00:00Z",
  "updated_at": "2026-05-09T00:00:00Z"
}
```

---

## Environment Variables

```bash
# Database
DB_SERVER=your_server
DB_USER=your_user
DB_PASSWORD=your_password
DB_DATABASE=your_db

# Authentication
JWT_SECRET=your_secret

# Google Places API (for clinic sync)
GOOGLE_PLACES_API_KEY=your_api_key

# Cloudinary (for pet images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Auto-Sync Control
ENABLE_AUTO_SYNC=true  # Set to false in development to disable auto-sync
```

---

## Database Schema

### Key Tables:
- **Owner** - Pet owners with device sessions
- **Pet** - Pets with Cloudinary image URLs
- **VetClinic** - Clinics with Google Places data and photos
- **DeviceSession** - Device-based login sessions

See `COMPLETE_DATABASE_SCHEMA.sql` for full details.

---

## Testing

**Start Backend:**
```bash
npm start
```

**Test in Postman:**
```
GET http://localhost:5000/api/vetclinics
```

**Manual Sync Trigger:**
```
POST http://localhost:5000/api/vetclinics/sync/manual
```

---

## Architecture Notes

- **Rate Limiting**: Google Places API limited to 200 calls/day with 100ms throttle between requests
- **Pagination**: Automatically fetches all result pages from Google Places
- **Caching**: 30-day refresh reduces API calls from ~2100/month to ~9/month
- **Reliability**: Fallback to OpenStreetMap if Google API unavailable
