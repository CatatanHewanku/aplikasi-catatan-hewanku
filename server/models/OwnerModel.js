import sql from "mssql"
import { dbConnection } from "../config/connection.js"

export class OwnerModel {
  // Create new owner
  static async createOwner(owner_name, owner_email, owner_password_hash, owner_phone_number, owner_image_url = null) {
    const connection = await dbConnection()
    const request = connection.request()

    request.input('owner_name', sql.VarChar, owner_name)
    request.input('owner_email', sql.VarChar, owner_email)
    request.input('owner_password_hash', sql.VarChar(sql.MAX), owner_password_hash)
    request.input('owner_phone_number', sql.VarChar, owner_phone_number)
    request.input('owner_image_url', sql.VarChar(sql.MAX), owner_image_url)

    const result = await request.query(`
      INSERT INTO PetOwner (owner_name, owner_email, owner_password_hash, owner_phone_number, owner_image_url)
      VALUES (@owner_name, @owner_email, @owner_password_hash, @owner_phone_number, @owner_image_url)
      SELECT CAST(SCOPE_IDENTITY() as INT) as owner_id, @owner_name as owner_name, @owner_email as owner_email, @owner_phone_number as owner_phone_number
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
      SELECT owner_id, owner_name, owner_email, owner_phone_number, owner_image_url
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
      SELECT owner_id, owner_name, owner_email, owner_phone_number, owner_image_url
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

  // Update owner with all fields including image
  static async updateOwnerFull(owner_id, owner_name, owner_email, owner_phone_number, owner_image_url) {
    const connection = await dbConnection()
    const request = connection.request()

    request.input('owner_id', sql.Int, owner_id)
    request.input('owner_name', sql.VarChar, owner_name)
    request.input('owner_email', sql.VarChar, owner_email)
    request.input('owner_phone_number', sql.VarChar, owner_phone_number)
    request.input('owner_image_url', sql.VarChar(sql.MAX), owner_image_url)

    await request.query(`
      UPDATE PetOwner
      SET owner_name = @owner_name,
          owner_email = @owner_email,
          owner_phone_number = @owner_phone_number,
          owner_image_url = @owner_image_url
      WHERE owner_id = @owner_id
    `)

    await connection.close()
    return { success: true }
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

  // Update owner image (called by uploadOwnerImage controller)
  static async updateOwnerImage(owner_id, owner_image_url) {
    const connection = await dbConnection()
    const request = connection.request()

    request.input('owner_id', sql.Int, owner_id)
    request.input('owner_image_url', sql.VarChar(sql.MAX), owner_image_url)

    await request.query(`
      UPDATE PetOwner
      SET owner_image_url = @owner_image_url
      WHERE owner_id = @owner_id
    `)

    await connection.close()
    return { success: true }
  }

  // Get owner by email or phone (for login)
  static async getOwnerByEmailOrPhone(identifier) {
    const connection = await dbConnection()
    const request = connection.request()

    request.input('identifier', sql.VarChar, identifier)

    const result = await request.query(`
    SELECT owner_id, owner_name, owner_email, owner_phone_number, owner_password_hash, owner_image_url
    FROM PetOwner
    WHERE owner_email = @identifier OR owner_phone_number = @identifier
  `)

    await connection.close()
    return result.recordset[0]
  }
}
