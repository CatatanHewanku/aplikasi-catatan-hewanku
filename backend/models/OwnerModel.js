import sql from "mssql"
import { dbConnection } from "../config/connection.js"

export class OwnerModel {
  // Create new owner
  static async createOwner(owner_name, owner_email, owner_password_hash, owner_phone_number) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('owner_name', sql.VarChar, owner_name)
    request.input('owner_email', sql.VarChar, owner_email)
    request.input('owner_password_hash', sql.VarChar(sql.MAX), owner_password_hash)
    request.input('owner_phone_number', sql.VarChar, owner_phone_number)
    
    const result = await request.query(`
      INSERT INTO PetOwner (owner_name, owner_email, owner_password_hash, owner_phone_number)
      VALUES (@owner_name, @owner_email, @owner_password_hash, @owner_phone_number)
      SELECT SCOPE_IDENTITY() as owner_id
    `)
    
    await connection.close()
    return result.recordset[0]
  }

  // Get owner by ID
  static async getOwnerById(owner_id) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('owner_id', sql.Int, owner_id)
    
    const result = await request.query(`
      SELECT owner_id, owner_name, owner_email, owner_phone_number
      FROM PetOwner
      WHERE owner_id = @owner_id
    `)
    
    await connection.close()
    return result.recordset[0]
  }

  // Get owner by email
  static async getOwnerByEmail(owner_email) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('owner_email', sql.VarChar, owner_email)
    
    const result = await request.query(`
      SELECT owner_id, owner_name, owner_email, owner_phone_number
      FROM PetOwner
      WHERE owner_email = @owner_email
    `)
    
    await connection.close()
    return result.recordset[0]
  }

  // Get owner by phone
  static async getOwnerByPhone(owner_phone_number) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('owner_phone_number', sql.VarChar, owner_phone_number)
    
    const result = await request.query(`
      SELECT owner_id, owner_name, owner_email, owner_phone_number
      FROM PetOwner
      WHERE owner_phone_number = @owner_phone_number
    `)
    
    await connection.close()
    return result.recordset[0]
  }

  // Get all owners
  static async getAllOwners() {
    const connection = await dbConnection()
    const request = connection.request()
    
    const result = await request.query(`
      SELECT owner_id, owner_name, owner_email, owner_phone_number
      FROM PetOwner
      ORDER BY created_at DESC
    `)
    
    await connection.close()
    return result.recordset
  }

  // Update owner
  static async updateOwner(owner_id, owner_name, owner_email, owner_phone_number) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('owner_id', sql.Int, owner_id)
    request.input('owner_name', sql.VarChar, owner_name)
    request.input('owner_email', sql.VarChar, owner_email)
    request.input('owner_phone_number', sql.VarChar, owner_phone_number)
    
    await request.query(`
      UPDATE PetOwner
      SET owner_name = @owner_name, owner_email = @owner_email, owner_phone_number = @owner_phone_number
      WHERE owner_id = @owner_id
    `)
    
    await connection.close()
    return { success: true, owner_id }
  }

  // Delete owner
  static async deleteOwner(owner_id) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('owner_id', sql.Int, owner_id)
    
    await request.query(`
      DELETE FROM PetOwner
      WHERE owner_id = @owner_id
    `)
    
    await connection.close()
    return { success: true, owner_id }
  }

  // Update password
  static async updatePassword(owner_id, new_password_hash) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('owner_id', sql.Int, owner_id)
    request.input('new_password_hash', sql.VarChar(sql.MAX), new_password_hash)
    
    await request.query(`
      UPDATE PetOwner
      SET owner_password_hash = @new_password_hash
      WHERE owner_id = @owner_id
    `)
    
    await connection.close()
    return { success: true, owner_id }
  }
}
