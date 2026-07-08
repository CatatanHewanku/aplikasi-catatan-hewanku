import sql from "mssql"
import { dbConnection } from "../config/connection.js"

export class PetModel {
  static async createPet(owner_id, pet_name, pet_type, pet_dob, pet_gender, pet_note, pet_image_url) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)
      request.input('pet_name', sql.VarChar, pet_name)
      request.input('pet_type', sql.VarChar, pet_type)
      request.input('pet_dob', sql.Date, pet_dob)
      request.input('pet_gender', sql.VarChar, pet_gender)
      request.input('pet_note', sql.VarChar(sql.MAX), pet_note || null)
      request.input('pet_image', sql.VarChar(sql.MAX), pet_image_url || null)

      const result = await request.query(`
        INSERT INTO Pet (owner_id, pet_name, pet_type, pet_dob, pet_gender, pet_note, pet_image)
        OUTPUT
            inserted.pet_id,
            inserted.owner_id,
            inserted.pet_name,
            inserted.pet_type,
            inserted.pet_dob,
            inserted.pet_gender,
            inserted.pet_note,
            inserted.pet_image
        VALUES (@owner_id, @pet_name, @pet_type, @pet_dob, @pet_gender, @pet_note, @pet_image)
      `)

      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  static async getPetById(pet_id, owner_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('pet_id', sql.Int, pet_id)
      request.input('owner_id', sql.Int, owner_id)

      const result = await request.query(`
        SELECT pet_id, owner_id, pet_name, pet_type, pet_dob, pet_gender, pet_note, pet_image, created_at
        FROM Pet
        WHERE pet_id = @pet_id and owner_id = @owner_id
      `)

      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  static async getPetsByOwner(owner_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)

      const result = await request.query(`
        SELECT pet_id, owner_id, pet_name, pet_type, pet_dob, pet_gender, pet_note, pet_image, created_at
        FROM Pet
        WHERE owner_id = @owner_id
        ORDER BY created_at DESC
      `)

      return result.recordset
    } finally {
      await connection.close()
    }
  }

  static async updatePet(pet_id, owner_id, pet_name, pet_type, pet_dob, pet_gender, pet_note, pet_image_url) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('pet_id', sql.Int, pet_id)
      request.input('owner_id', sql.Int, owner_id)
      request.input('pet_name', sql.VarChar, pet_name)
      request.input('pet_type', sql.VarChar, pet_type)
      request.input('pet_dob', sql.Date, pet_dob)
      request.input('pet_gender', sql.VarChar, pet_gender)
      request.input('pet_note', sql.VarChar(sql.MAX), pet_note || null)
      request.input('pet_image', sql.VarChar(sql.MAX), pet_image_url || null)

      const result = await request.query(`
        UPDATE Pet
        SET 
            pet_name = @pet_name, 
            pet_type = @pet_type, 
            pet_dob = @pet_dob, 
            pet_gender = @pet_gender, 
            pet_note = @pet_note,
            pet_image = @pet_image
        OUTPUT
            inserted.pet_id,
            inserted.owner_id,
            inserted.pet_name,
            inserted.pet_type,
            inserted.pet_dob,
            inserted.pet_gender,
            inserted.pet_note,
            inserted.pet_image
        WHERE pet_id = @pet_id AND owner_id = @owner_id
      `)

      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  static async deletePet(pet_id, owner_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('pet_id', sql.Int, pet_id)
      request.input('owner_id', sql.Int, owner_id)

      await request.query(`
        DELETE FROM Pet
        WHERE pet_id = @pet_id AND owner_id = @owner_id
      `)

      return { success: true, pet_id }
    } finally {
      await connection.close()
    }
  }
}
