import sql from "mssql"
import { dbConnection } from "../config/connection.js"

export class PetModel {
  // Create new pet
  static async createPet(owner_id, pet_name, pet_type, pet_dob, pet_gender, pet_note, pet_image, pet_image_type) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('owner_id', sql.Int, owner_id)
    request.input('pet_name', sql.VarChar, pet_name)
    request.input('pet_type', sql.VarChar, pet_type)
    request.input('pet_dob', sql.Date, pet_dob)
    request.input('pet_gender', sql.VarChar, pet_gender)
    request.input('pet_note', sql.VarChar(sql.MAX), pet_note || null)
    request.input('pet_image', sql.VarChar(sql.MAX), pet_image || null)
    request.input('pet_image_type', sql.VarChar(50), pet_image_type || null)
    
    const result = await request.query(`
      INSERT INTO Pet (owner_id, pet_name, pet_type, pet_dob, pet_gender, pet_note, pet_image, pet_image_type)
      VALUES (@owner_id, @pet_name, @pet_type, @pet_dob, @pet_gender, @pet_note, @pet_image, @pet_image_type)
      SELECT SCOPE_IDENTITY() as pet_id
    `)
    
    await connection.close()
    return result.recordset[0]
  }

  // Get pet by ID
  static async getPetById(pet_id) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('pet_id', sql.Int, pet_id)
    
    const result = await request.query(`
      SELECT pet_id, owner_id, pet_name, pet_type, pet_dob, pet_gender, pet_note, created_at
      FROM Pet
      WHERE pet_id = @pet_id
    `)
    
    await connection.close()
    return result.recordset[0]
  }

  // Get all pets by owner
  static async getPetsByOwner(owner_id) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('owner_id', sql.Int, owner_id)
    
    const result = await request.query(`
      SELECT pet_id, owner_id, pet_name, pet_type, pet_dob, pet_gender, pet_note, created_at
      FROM Pet
      WHERE owner_id = @owner_id
      ORDER BY created_at DESC
    `)
    
    await connection.close()
    return result.recordset
  }

  // Update pet
  static async updatePet(pet_id, pet_name, pet_type, pet_dob, pet_gender, pet_note, pet_image, pet_image_type) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('pet_id', sql.Int, pet_id)
    request.input('pet_name', sql.VarChar, pet_name)
    request.input('pet_type', sql.VarChar, pet_type)
    request.input('pet_dob', sql.Date, pet_dob)
    request.input('pet_gender', sql.VarChar, pet_gender)
    request.input('pet_note', sql.VarChar(sql.MAX), pet_note || null)
    request.input('pet_image', sql.VarChar(sql.MAX), pet_image || null)
    request.input('pet_image_type', sql.VarChar(50), pet_image_type || null)
    
    await request.query(`
      UPDATE Pet
      SET pet_name = @pet_name, pet_type = @pet_type, pet_dob = @pet_dob, pet_gender = @pet_gender, pet_note = @pet_note, pet_image = @pet_image, pet_image_type = @pet_image_type
      WHERE pet_id = @pet_id
    `)
    
    await connection.close()
    return { success: true, pet_id }
  }

  // Delete pet
  static async deletePet(pet_id) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('pet_id', sql.Int, pet_id)
    
    await request.query(`
      DELETE FROM Pet
      WHERE pet_id = @pet_id
    `)
    
    await connection.close()
    return { success: true, pet_id }
  }
}
