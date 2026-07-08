import sql from "mssql"
import { dbConnection } from "../config/connection.js"

export class ReminderModel {
  static async createReminder(owner_id, reminder_date, reminder_title, reminder_time, reminder_category) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
      const timeWithSeconds = reminder_time.length === 5 ? `${reminder_time}:00` : reminder_time

      request.input('owner_id', sql.Int, owner_id)
      request.input('reminder_date', sql.Date, reminder_date)
      request.input('reminder_title', sql.VarChar, reminder_title)
      request.input('reminder_time', sql.VarChar, timeWithSeconds)
      request.input('reminder_category', sql.VarChar, reminder_category)

      const result = await request.query(`
        INSERT INTO Reminder (owner_id, reminder_date, reminder_title, reminder_time, reminder_category)
        OUTPUT
            inserted.reminder_id,
            inserted.owner_id,
            inserted.reminder_date,
            inserted.reminder_title,
            CONVERT(VARCHAR(5), CAST(inserted.reminder_time AS TIME), 108) AS reminder_time,
            inserted.reminder_category,
            inserted.is_completed
        VALUES (@owner_id, @reminder_date, @reminder_title, CAST(@reminder_time AS TIME), @reminder_category)
      `)

      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

  static async getReminderByDate(owner_id, reminder_date) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)
      request.input('reminder_date', sql.Date, reminder_date)

      const result = await request.query(`
        SELECT reminder_id, owner_id, reminder_date, reminder_title, 
               CONVERT(VARCHAR(5), reminder_time, 108) AS reminder_time, 
               reminder_category, is_completed
        FROM Reminder
        WHERE reminder_date = @reminder_date AND owner_id = @owner_id
        ORDER BY reminder_time ASC
      `)

      return result.recordset
    } finally {
      await connection.close()
    }
  }

  static async getReminderByMonthYear(owner_id, year, month) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)
      request.input('year', sql.Int, year)
      request.input('month', sql.Int, month)

      const result = await request.query(`
        SELECT reminder_id, owner_id, reminder_date, reminder_title, 
               CONVERT(VARCHAR(5), reminder_time, 108) AS reminder_time, 
               reminder_category, is_completed
        FROM Reminder
        WHERE owner_id = @owner_id 
              AND YEAR(reminder_date) = @year 
              AND MONTH(reminder_date) = @month
        ORDER BY reminder_date ASC, reminder_time ASC
      `)

      return result.recordset
    } finally {
      await connection.close()
    }
  }

  static async getUpcomingReminders(owner_id, daysAhead = 90) {
    const connection = await dbConnection()

    try {
      const request = connection.request()

      request.input('owner_id', sql.Int, owner_id)
      request.input('daysAhead', sql.Int, daysAhead)

      const result = await request.query(`
        SELECT reminder_id, owner_id, reminder_date, reminder_title, 
               CONVERT(VARCHAR(5), reminder_time, 108) AS reminder_time, 
               reminder_category, is_completed
        FROM Reminder
        WHERE owner_id = @owner_id 
              AND reminder_date >= CAST(GETDATE() AS DATE)
              AND reminder_date < DATEADD(day, @daysAhead, CAST(GETDATE() AS DATE))
        ORDER BY reminder_date ASC, reminder_time ASC
      `)

      return result.recordset
    } finally {
      await connection.close()
    }
  }

  static async updateReminderById(reminder_id, reminder_title, reminder_time, reminder_category) {
    const connection = await dbConnection()

    try {
      const request = connection.request()
      const timeWithSeconds = reminder_time.length === 5 ? `${reminder_time}:00` : reminder_time

      request.input('reminder_id', sql.Int, reminder_id)
      request.input('reminder_title', sql.VarChar, reminder_title)
      request.input('reminder_time', sql.VarChar, timeWithSeconds)
      request.input('reminder_category', sql.VarChar, reminder_category)

      const result = await request.query(`
        UPDATE Reminder
        SET
            reminder_title = @reminder_title,
            reminder_time = CAST(@reminder_time AS TIME),
            reminder_category = @reminder_category
        OUTPUT
            inserted.reminder_id,
            inserted.owner_id,
            inserted.reminder_date,
            inserted.reminder_title,
            CONVERT(VARCHAR(5), inserted.reminder_time, 108) AS reminder_time,
            inserted.reminder_category
        WHERE reminder_id = @reminder_id
      `)

      return result.recordset[0]
    } finally {
      await connection.close()
    }
  }

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
