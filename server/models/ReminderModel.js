import sql from "mssql"
import { dbConnection } from "../config/connection.js"

export class ReminderModel {
  // Create new reminder
  static async createReminder(owner_id, reminder_date, reminder_title, reminder_time, reminder_category) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)
      request.input('reminder_date', sql.Date, reminder_date)
      request.input('reminder_title', sql.VarChar, reminder_title)
      request.input('reminder_time', sql.Time, reminder_time)
      request.input('reminder_category', sql.VarChar, reminder_category)

      const result = await request.query(`
        INSERT INTO Reminder (owner_id, reminder_date, reminder_title, reminder_time, reminder_category)
        OUTPUT
            inserted.reminder_id,
            inserted.owner_id,
            inserted.reminder_date,
            inserted.reminder_title,
            inserted.reminder_time,
            inserted.reminder_category
        VALUES (@owner_id, @reminder_date, @reminder_title, @reminder_time, @reminder_category)
      `)

      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  // Get reminder by Date
  static async getReminderByDate(owner_id, reminder_date) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)
      request.input('reminder_date', sql.Date, reminder_date)

      const result = await request.query(`
        SELECT reminder_id, owner_id, reminder_date, reminder_title, reminder_time, reminder_category
        FROM Reminder
        WHERE reminder_date = @reminder_date AND owner_id = @owner_id
        ORDER BY reminder_time ASC
      `)

      return result.recordset
    } finally {
      await connection.close()
    }
  }

  // Update reminder by ID
  static async updateReminderById(reminder_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('reminder_id', sql.Int, reminder_id)
      request.input('reminder_title', sql.VarChar, reminder_title)
      request.input('reminder_date', sql.Date, reminder_date)
      request.input('reminder_category', sql.VarChar, reminder_category)

      const result = await request.query(`
        UPDATE Reminder
        SET
            reminder_title = @reminder_title,
            reminder_time = @reminder_time,
            reminder_category = @reminder_category
        OUTPUT
            inserted.reminder_id,
            inserted.owner_id,
            inserted.reminder_date,
            inserted.reminder_title,
            inserted.reminder_time,
            inserted.reminder_category
        WHERE reminder_id = @reminder_id
      `)

      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  // Delete reminder by ID
  static async deleteReminderById(reminder_id) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('reminder_id', sql.Int, reminder_id)

      const result = await request.query(`
        DELETE FROM Reminder
        WHERE reminder_id = @reminder_id
      `)

      return { success: true, reminder_id }
    } finally {
      await connection.close()
    }
  }
}
