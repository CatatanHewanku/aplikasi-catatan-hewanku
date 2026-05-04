import sql from "mssql"
import { dbConnection } from "../config/connection.js"

export class UserSessionModel {
  // Create new session
  static async createSession(owner_id, device_id, token, expiresAt) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('owner_id', sql.Int, owner_id)
    request.input('device_id', sql.VarChar, device_id)
    request.input('token', sql.VarChar(sql.MAX), token)
    request.input('expires_at', sql.DateTime, expiresAt)
    
    const result = await request.query(`
      INSERT INTO UserSession (owner_id, device_id, token, is_active, expires_at)
      VALUES (@owner_id, @device_id, @token, 1, @expires_at)
      SELECT SCOPE_IDENTITY() as session_id
    `)
    
    await connection.close()
    return result.recordset[0]
  }

  // Check if device has active session
  static async getActiveSessionByDevice(device_id) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('device_id', sql.VarChar, device_id)
    
    const result = await request.query(`
      SELECT session_id, owner_id, device_id, token, is_active, expires_at
      FROM UserSession
      WHERE device_id = @device_id AND is_active = 1 AND expires_at > GETDATE()
    `)
    
    await connection.close()
    return result.recordset[0]
  }

  // Invalidate session by device (logout)
  static async invalidateSessionByDevice(device_id) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('device_id', sql.VarChar, device_id)
    
    await request.query(`
      UPDATE UserSession
      SET is_active = 0
      WHERE device_id = @device_id AND is_active = 1
    `)
    
    await connection.close()
    return { success: true }
  }

  // Verify token is from active session on that device
  static async verifySessionToken(device_id, token) {
    const connection = await dbConnection()
    const request = connection.request()
    
    request.input('device_id', sql.VarChar, device_id)
    request.input('token', sql.VarChar(sql.MAX), token)
    
    const result = await request.query(`
      SELECT session_id, owner_id, device_id, is_active, expires_at
      FROM UserSession
      WHERE device_id = @device_id AND token = @token AND is_active = 1 AND expires_at > GETDATE()
    `)
    
    await connection.close()
    return result.recordset[0]
  }
}
