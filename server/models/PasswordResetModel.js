import sql from "mssql"
import { dbConnection } from "../config/connection.js"

export class PasswordResetModel {
  // Save reset code
  static async saveResetCode(owner_id, verification_code, code_expiry) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('owner_id', sql.Int, owner_id)
    request.input('verification_code', sql.VarChar, verification_code)
    request.input('code_expiry', sql.DateTime, code_expiry)
    
    const result = await request.query(`
      INSERT INTO PasswordReset (owner_id, verification_code, token_expiry)
      VALUES (@owner_id, @verification_code, @code_expiry)
      SELECT SCOPE_IDENTITY() as reset_id
    `)
    
    await connection.close()
    return result.recordset[0]
  }

  // Get reset code by owner_id and code
  static async getResetCode(owner_id, verification_code) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('owner_id', sql.Int, owner_id)
    request.input('verification_code', sql.VarChar, verification_code)
    
    const result = await request.query(`
      SELECT reset_id, owner_id, verification_code, token_expiry, code_attempts, is_used, created_at
      FROM PasswordReset
      WHERE owner_id = @owner_id AND verification_code = @verification_code
    `)
    
    await connection.close()
    return result.recordset[0]
  }

  // Mark code as used by owner_id
  static async markTokenAsUsed(owner_id) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('owner_id', sql.Int, owner_id)
    
    await request.query(`
      DELETE FROM PasswordReset
      WHERE owner_id = @owner_id AND is_used = 0
    `)
    
    await connection.close()
    return { success: true }
  }

  // Increment failed attempts
  static async incrementCodeAttempts(owner_id) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('owner_id', sql.Int, owner_id)
    
    await request.query(`
      UPDATE PasswordReset
      SET code_attempts = code_attempts + 1
      WHERE owner_id = @owner_id AND is_used = 0
    `)
    
    await connection.close()
    return { success: true }
  }

  // Delete expired codes
  static async deleteExpiredTokens() {
    const connection = await dbConnection()
    const request = connection.request()
    
    await request.query(`
      DELETE FROM PasswordReset
      WHERE token_expiry < GETDATE()
    `)
    
    await connection.close()
    return { success: true }
  }

  // Delete expired code by owner_id
  static async deleteExpiredCodes(owner_id) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('owner_id', sql.Int, owner_id)
    
    await request.query(`
      DELETE FROM PasswordReset
      WHERE owner_id = @owner_id AND token_expiry < GETDATE()
    `)
    
    await connection.close()
    return { success: true }
  }
}
