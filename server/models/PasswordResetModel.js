import sql from "mssql"
import { dbConnection } from "../config/connection.js"

export class PasswordResetModel {
  static async saveResetCode(owner_id, verification_code, code_expiry) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)
      request.input('verification_code', sql.VarChar, verification_code)
      request.input('code_expiry', sql.DateTime, code_expiry)

      const result = await request.query(`
        INSERT INTO PasswordReset (owner_id, verification_code, token_expiry)
        OUTPUT inserted.reset_id
        VALUES (@owner_id, @verification_code, @code_expiry)
      `)

      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  static async getResetCode(owner_id, verification_code) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)
      request.input('verification_code', sql.VarChar, verification_code)

      const result = await request.query(`
        SELECT reset_id, owner_id, verification_code, token_expiry, code_attempts, is_used, created_at
        FROM PasswordReset
        WHERE owner_id = @owner_id AND verification_code = @verification_code
      `)

      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  static async markTokenAsUsed(owner_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)

      await request.query(`
        DELETE FROM PasswordReset
        WHERE owner_id = @owner_id AND is_used = 0
      `)

      return { success: true }
    } finally {
      await connection.close()
    }
  }

  static async incrementCodeAttempts(owner_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)

      await request.query(`
        UPDATE PasswordReset
        SET code_attempts = code_attempts + 1
        WHERE owner_id = @owner_id AND is_used = 0
      `)

      return { success: true }
    } finally {
      await connection.close()
    }
  }

  static async deleteExpiredTokens() {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      await request.query(`
        DELETE FROM PasswordReset
        WHERE token_expiry < GETDATE()
      `)

      return { success: true }
    } finally {
      await connection.close()
    }
  }

  static async deleteExpiredCodes(owner_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)

      await request.query(`
        DELETE FROM PasswordReset
        WHERE owner_id = @owner_id AND token_expiry < GETDATE()
      `)

      return { success: true }
    } finally {
      await connection.close()
    }
  }
}
