import sql from "mssql"
import { dbConnection } from "../config/connection.js"

export class OwnerModel {
  static async createOwner(owner_name, owner_email, owner_password_hash, owner_phone_number, owner_image_url) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_name', sql.VarChar, owner_name)
      request.input('owner_email', sql.VarChar, owner_email)
      request.input('owner_password_hash', sql.VarChar(sql.MAX), owner_password_hash)
      request.input('owner_phone_number', sql.VarChar, owner_phone_number)
      request.input('owner_image_url', sql.VarChar(sql.MAX), null)

      const result = await request.query(`
        INSERT INTO PetOwner (owner_name, owner_email, owner_password_hash, owner_phone_number, owner_image_url)
        OUTPUT 
            inserted.owner_id, 
            inserted.owner_name, 
            inserted.owner_email, 
            inserted.owner_phone_number,
            inserted.owner_image_url
        VALUES (@owner_name, @owner_email, @owner_password_hash, @owner_phone_number, @owner_image_url)
      `)

      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  static async getOwnerById(owner_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)

      const result = await request.query(`
        SELECT owner_id, owner_name, owner_email, owner_phone_number, owner_image_url
        FROM PetOwner
        WHERE owner_id = @owner_id
      `)

      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  static async getOwnerByEmail(owner_email) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_email', sql.VarChar, owner_email)

      const result = await request.query(`
        SELECT owner_id, owner_name, owner_email, owner_phone_number, owner_image_url
        FROM PetOwner
        WHERE owner_email = @owner_email
      `)

      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  static async getOwnerByPhone(owner_phone_number) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_phone_number', sql.VarChar, owner_phone_number)

      const result = await request.query(`
        SELECT owner_id, owner_name, owner_email, owner_phone_number
        FROM PetOwner
        WHERE owner_phone_number = @owner_phone_number
      `)

      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  static async getAllOwners() {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      const result = await request.query(`
        SELECT owner_id, owner_name, owner_email, owner_phone_number
        FROM PetOwner
        ORDER BY created_at DESC
      `)

      return result.recordset
    } finally {
      await connection.close()
    }
  }

  static async updateOwner(owner_id, owner_name, owner_email, owner_phone_number) {
    const connection = await dbConnection()

    try {
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

      return { success: true, owner_id }
    } finally {
      await connection.close()
    }
  }

  static async updateOwnerFull(owner_id, owner_name, owner_email, owner_phone_number, owner_image_url) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)
      request.input('owner_name', sql.VarChar, owner_name)
      request.input('owner_email', sql.VarChar, owner_email)
      request.input('owner_phone_number', sql.VarChar, owner_phone_number)
      request.input('owner_image_url', sql.VarChar(sql.MAX), owner_image_url)

      await request.query(`
        UPDATE PetOwner
        SET 
            owner_name = @owner_name,
            owner_email = @owner_email,
            owner_phone_number = @owner_phone_number,
            owner_image_url = @owner_image_url
        WHERE owner_id = @owner_id
      `)

      return { success: true }
    } finally {
      await connection.close()
    }
  }

  static async deleteOwner(owner_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)

      await request.query(`
        DELETE FROM PetOwner
        WHERE owner_id = @owner_id
      `)

      return { success: true, owner_id }
    } finally {
      await connection.close()
    }
  }

  static async updatePassword(owner_id, new_password_hash) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)
      request.input('new_password_hash', sql.VarChar(sql.MAX), new_password_hash)

      await request.query(`
        UPDATE PetOwner
        SET owner_password_hash = @new_password_hash
        WHERE owner_id = @owner_id
      `)

      return { success: true, owner_id }
    } finally {
      await connection.close()
    }
  }

  static async updateOwnerImage(owner_id, owner_image_url) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)
      request.input('owner_image_url', sql.VarChar(sql.MAX), owner_image_url)

      await request.query(`
        UPDATE PetOwner
        SET owner_image_url = @owner_image_url
        WHERE owner_id = @owner_id
      `)

      return { success: true }
    } finally {
      await connection.close()
    }
  }

  static async getOwnerByEmailOrPhone(identifier) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('identifier', sql.VarChar, identifier)

      const result = await request.query(`
      SELECT owner_id, owner_name, owner_email, owner_phone_number, owner_password_hash, owner_image_url
      FROM PetOwner
      WHERE owner_email = @identifier OR owner_phone_number = @identifier
    `)

      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }
}