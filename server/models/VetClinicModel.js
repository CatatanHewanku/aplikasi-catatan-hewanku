import sql from "mssql"
import { dbConnection } from "../config/connection.js"

export class VetClinicModel {
  static async createClinic(clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_phone, place_id, clinic_photo_reference = null) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
      
      request.input('clinic_name', sql.VarChar, clinic_name)
      request.input('clinic_address', sql.VarChar, clinic_address)
      request.input('clinic_latitude', sql.Decimal(10, 8), clinic_latitude)
      request.input('clinic_longitude', sql.Decimal(11, 8), clinic_longitude)
      request.input('clinic_phone', sql.VarChar, clinic_phone || null)
      request.input('place_id', sql.VarChar, place_id)
      request.input('clinic_photo_reference', sql.VarChar(sql.MAX), clinic_photo_reference || null)
      
      const result = await request.query(`
        INSERT INTO VetClinic (clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_phone, place_id, clinic_photo_reference)
        OUTPUT inserted.clinic_id
        VALUES (@clinic_name, @clinic_address, @clinic_latitude, @clinic_longitude, @clinic_phone, @place_id, @clinic_photo_reference)
      `)
      
      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  static async getClinicById(clinic_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
      
      request.input('clinic_id', sql.Int, clinic_id)
      
      const result = await request.query(`
        SELECT clinic_id, clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_phone, clinic_photo_cloudinary_url, clinic_photo_reference, place_id, created_at
        FROM VetClinic
        WHERE clinic_id = @clinic_id
      `)
      
      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  static async getAllClinics() {
    const connection = await dbConnection()

    try {
      const request = connection.request()
      
      const result = await request.query(`
        SELECT clinic_id, clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_phone, clinic_photo_cloudinary_url, clinic_photo_reference, place_id, created_at
        FROM VetClinic
        ORDER BY clinic_name ASC
      `)
      
      return result.recordset
    } finally {
      await connection.close()
    }
  }

  static async searchClinics(search_term) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
      
      request.input('search_term', sql.VarChar, `%${search_term}%`)
      
      const result = await request.query(`
        SELECT clinic_id, clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_phone, clinic_photo_cloudinary_url, clinic_photo_reference, place_id, created_at
        FROM VetClinic
        WHERE clinic_name LIKE @search_term OR clinic_address LIKE @search_term
        ORDER BY clinic_name ASC
      `)
      
      return result.recordset
    } finally {
      await connection.close()
    }
  }

  static async updateClinicByPlaceId(place_id, clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_phone, clinic_photo_reference) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
      
      request.input('place_id', sql.VarChar, place_id)
      request.input('clinic_name', sql.VarChar, clinic_name)
      request.input('clinic_address', sql.VarChar, clinic_address)
      request.input('clinic_latitude', sql.Decimal(10, 8), clinic_latitude)
      request.input('clinic_longitude', sql.Decimal(11, 8), clinic_longitude)
      request.input('clinic_phone', sql.VarChar, clinic_phone || null)
      request.input('clinic_photo_reference', sql.VarChar(sql.MAX), clinic_photo_reference || null)
      
      const result = await request.query(`
        UPDATE VetClinic
        SET
            clinic_name = @clinic_name,
            clinic_address = @clinic_address,
            clinic_latitude = @clinic_latitude,
            clinic_longitude = @clinic_longitude,
            clinic_phone = @clinic_phone,
            clinic_photo_reference = @clinic_photo_reference
        OUTPUT
            inserted.place_id,
            inserted.clinic_name,
            inserted.clinic_address,
            inserted.clinic_latitude,
            inserted.clinic_longitude,
            inserted.clinic_phone,
            inserted.clinic_photo_reference
        WHERE place_id = @place_id
      `)
      
      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  static async clinicExistsByPlaceId(place_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
      
      request.input('place_id', sql.VarChar, place_id)
      
      const result = await request.query(`
        SELECT clinic_id FROM VetClinic WHERE place_id = @place_id
      `)
      
      return result.recordset.length > 0
    } finally {
      await connection.close()
    }
  }

  static async updateClinicPhotoUrl(clinic_id, cloudinaryUrl) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
  
      request.input('clinic_id', sql.Int, clinic_id)
      request.input('cloudinary_url', sql.VarChar(sql.MAX), cloudinaryUrl)
  
      await request.query(`
        UPDATE VetClinic
        SET clinic_photo_cloudinary_url = @cloudinary_url
        OUTPUT
            inserted.clinic_id,
            inserted.clinic_photo_cloudinary_url
        WHERE clinic_id = @clinic_id
      `)
  
      return { success: true }
    } finally {
      await connection.close()
    }
  }

  static async getClinicsByDistance(userLatitude, userLongitude) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
  
      request.input('userLat', sql.Decimal(10, 8), userLatitude)
      request.input('userLng', sql.Decimal(11, 8), userLongitude)
  
      const result = await request.query(`
        SELECT 
          clinic_id, clinic_name, clinic_address, clinic_latitude, clinic_longitude, 
          clinic_phone, clinic_photo_cloudinary_url, clinic_photo_reference, place_id,
          ROUND(
            SQRT(
              POWER((clinic_latitude - @userLat) * 111.32, 2) + 
              POWER((clinic_longitude - @userLng) * 111.32 * COS(RADIANS(@userLat)), 2)
            ), 
            2
          ) as distance_km
        FROM VetClinic
        ORDER BY distance_km ASC
      `)
  
      return result.recordset
    } finally {
      await connection.close()
    }
  }
}
