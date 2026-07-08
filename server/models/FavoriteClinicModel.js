import sql from "mssql"
import { dbConnection } from "../config/connection.js"

export class FavoriteClinicModel {
  static async addFavorite(owner_id, clinic_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
  
      request.input('owner_id', sql.Int, owner_id)
      const countResult = await request.query(`
        SELECT COUNT(*) as count FROM FavoriteClinic WHERE owner_id = @owner_id
      `)
      
      if (countResult.recordset[0].count >= 3) {
        await connection.close()
        throw new Error('Maximum 3 favorite clinics allowed')
      }
  
      const checkRequest = connection.request()
      checkRequest.input('owner_id', sql.Int, owner_id)
      checkRequest.input('clinic_id', sql.Int, clinic_id)
      const existResult = await checkRequest.query(`
        SELECT favorite_id FROM FavoriteClinic 
        WHERE owner_id = @owner_id AND clinic_id = @clinic_id
      `)
  
      if (existResult.recordset.length > 0) {
        await connection.close()
        throw new Error('Clinic is already favorited')
      }
  
      const insertRequest = connection.request()
      insertRequest.input('owner_id', sql.Int, owner_id)
      insertRequest.input('clinic_id', sql.Int, clinic_id)
      
      const result = await insertRequest.query(`
        INSERT INTO FavoriteClinic (owner_id, clinic_id)
        OUTPUT inserted.favorite_id
        VALUES (@owner_id, @clinic_id)
      `)
  
      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  static async getFavoritesByOwner(owner_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
  
      request.input('owner_id', sql.Int, owner_id)
      
      const result = await request.query(`
        SELECT 
          f.favorite_id,
          f.owner_id,
          v.clinic_id,
          v.clinic_name,
          v.clinic_address,
          v.clinic_latitude,
          v.clinic_longitude,
          v.clinic_photo_cloudinary_url,
          v.clinic_photo_reference,
          v.place_id,
          f.created_at
        FROM FavoriteClinic f
        JOIN VetClinic v ON f.clinic_id = v.clinic_id
        WHERE f.owner_id = @owner_id
        ORDER BY f.created_at DESC
      `)
  
      return result.recordset
    } finally {
      await connection.close()
    }
  }

  static async removeFavorite(owner_id, clinic_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
  
      request.input('owner_id', sql.Int, owner_id)
      request.input('clinic_id', sql.Int, clinic_id)
  
      await request.query(`
        DELETE FROM FavoriteClinic
        WHERE owner_id = @owner_id AND clinic_id = @clinic_id
      `)
  
      return { success: true, owner_id, clinic_id }
    } finally {
      await connection.close()
    }
  }

  static async isFavorited(owner_id, clinic_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
  
      request.input('owner_id', sql.Int, owner_id)
      request.input('clinic_id', sql.Int, clinic_id)
  
      const result = await request.query(`
        SELECT favorite_id FROM FavoriteClinic
        WHERE owner_id = @owner_id AND clinic_id = @clinic_id
      `)
  
      return result.recordset.length > 0
    } finally {
      await connection.close()
    }
  }
}
