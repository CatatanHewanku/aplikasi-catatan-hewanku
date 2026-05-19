import sql from "mssql"
import { dbConnection } from "../config/connection.js"

export class UserSessionModel {
  // Create new session
  static async createSession(owner_id, device_id, token, expiresAt) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
      
      request.input('owner_id', sql.Int, owner_id)
      request.input('device_id', sql.VarChar, device_id)
      request.input('token', sql.VarChar(sql.MAX), token)
      request.input('expires_at', sql.DateTime, expiresAt)
      
      const result = await request.query(`
        INSERT INTO UserSession (owner_id, device_id, token, is_active, expires_at)
        OUTPUT inserted.session_id
        VALUES (@owner_id, @device_id, @token, 1, @expires_at)
      `)
      
      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  // Check if device has active session
  static async getActiveSessionByDevice(device_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
      
      request.input('device_id', sql.VarChar, device_id)
      
      const result = await request.query(`
        SELECT session_id, owner_id, device_id, token, is_active, expires_at
        FROM UserSession
        WHERE device_id = @device_id AND is_active = 1 AND expires_at > GETDATE()
      `)
      
      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  // Hard delete session by device (logout)
  static async deleteSessionByDevice(device_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
      
      request.input('device_id', sql.VarChar, device_id)
      
      await request.query(`
        DELETE FROM UserSession
        WHERE device_id = @device_id
      `)
      
      return { success: true }
    } finally {
      await connection.close()
    }
  }

  // Invalidate session by device (logout) - kept for backwards compatibility
  static async invalidateSessionByDevice(device_id) {
    return this.deleteSessionByDevice(device_id)
  }

  // Verify token is from active session on that device
  static async verifySessionToken(device_id, token) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
      
      request.input('device_id', sql.VarChar, device_id)
      request.input('token', sql.VarChar(sql.MAX), token)
      
      const result = await request.query(`
        SELECT session_id, owner_id, device_id, is_active, expires_at
        FROM UserSession
        WHERE device_id = @device_id AND token = @token AND is_active = 1 AND expires_at > GETDATE()
      `)
      
      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }
}
