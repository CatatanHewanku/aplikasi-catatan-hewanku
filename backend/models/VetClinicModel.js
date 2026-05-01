import sql from "mssql"
import { dbConnection } from "../config/connection.js"

export class VetClinicModel {
  // Create new clinic
  static async createClinic(clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_status, google_map_url, place_id) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('clinic_name', sql.VarChar, clinic_name)
    request.input('clinic_address', sql.VarChar, clinic_address)
    request.input('clinic_latitude', sql.Decimal(10, 8), clinic_latitude)
    request.input('clinic_longitude', sql.Decimal(11, 8), clinic_longitude)
    request.input('clinic_status', sql.VarChar, clinic_status)
    request.input('google_map_url', sql.VarChar(sql.MAX), google_map_url || null)
    request.input('place_id', sql.VarChar, place_id)
    
    const result = await request.query(`
      INSERT INTO VetClinic (clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_status, google_map_url, place_id)
      VALUES (@clinic_name, @clinic_address, @clinic_latitude, @clinic_longitude, @clinic_status, @google_map_url, @place_id)
      SELECT SCOPE_IDENTITY() as clinic_id
    `)
    
    await connection.close()
    return result.recordset[0]
  }

  // Get clinic by ID
  static async getClinicById(clinic_id) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('clinic_id', sql.Int, clinic_id)
    
    const result = await request.query(`
      SELECT clinic_id, clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_status, google_map_url, place_id, created_at
      FROM VetClinic
      WHERE clinic_id = @clinic_id
    `)
    
    await connection.close()
    return result.recordset[0]
  }

  // Get all clinics
  static async getAllClinics() {
    const connection = await dbConnection()
    const request = connection.request()
    
    const result = await request.query(`
      SELECT clinic_id, clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_status, google_map_url, place_id, created_at
      FROM VetClinic
      ORDER BY clinic_name ASC
    `)
    
    await connection.close()
    return result.recordset
  }

  // Search clinics by name or address
  static async searchClinics(search_term) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('search_term', sql.VarChar, `%${search_term}%`)
    
    const result = await request.query(`
      SELECT clinic_id, clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_status, google_map_url, place_id, created_at
      FROM VetClinic
      WHERE clinic_name LIKE @search_term OR clinic_address LIKE @search_term
      ORDER BY clinic_name ASC
    `)
    
    await connection.close()
    return result.recordset
  }

  // Update clinic
  static async updateClinic(clinic_id, clinic_name, clinic_address, clinic_latitude, clinic_longitude, clinic_status, google_map_url) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('clinic_id', sql.Int, clinic_id)
    request.input('clinic_name', sql.VarChar, clinic_name)
    request.input('clinic_address', sql.VarChar, clinic_address)
    request.input('clinic_latitude', sql.Decimal(10, 8), clinic_latitude)
    request.input('clinic_longitude', sql.Decimal(11, 8), clinic_longitude)
    request.input('clinic_status', sql.VarChar, clinic_status)
    request.input('google_map_url', sql.VarChar(sql.MAX), google_map_url || null)
    
    await request.query(`
      UPDATE VetClinic
      SET clinic_name = @clinic_name, clinic_address = @clinic_address, clinic_latitude = @clinic_latitude, clinic_longitude = @clinic_longitude, clinic_status = @clinic_status, google_map_url = @google_map_url
      WHERE clinic_id = @clinic_id
    `)
    
    await connection.close()
    return { success: true, clinic_id }
  }
}
