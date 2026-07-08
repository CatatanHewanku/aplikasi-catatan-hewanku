import { ReminderModel } from "../models/ReminderModel.js";

export class ReminderController {
  static async createReminder(req, res) {
    try {
      const { owner_id, reminder_date, reminder_title, reminder_time, reminder_category } = req.body;
      if (!owner_id || !reminder_date || !reminder_title || !reminder_time) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (!reminder_time.match(/^\d{2}:\d{2}$/)) {
        return res.status(400).json({ message: "Invalid time format. Expected HH:MM" });
      }

      const reminder = await ReminderModel.createReminder(owner_id, reminder_date, reminder_title, reminder_time, reminder_category || null);
      res.status(201).json({ message: "Reminder created", data: reminder });
    } catch (err) {
      console.error("Create reminder error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  static async updateReminder(req, res) {
    try {
      const { reminder_id } = req.params;
      const { reminder_title, reminder_time, reminder_category } = req.body;
      
      if (!reminder_id || !reminder_title || !reminder_time) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (!reminder_time.match(/^\d{2}:\d{2}$/)) {
        return res.status(400).json({ message: "Invalid time format. Expected HH:MM" });
      }

      const reminder = await ReminderModel.updateReminderById(reminder_id, reminder_title, reminder_time, reminder_category || null);
      res.status(200).json({ message: "Reminder updated", data: reminder });
    } catch (err) {
      console.error("Update reminder error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  static async getRemindersByDate(req, res) {
    try {
      const { owner_id, reminder_date } = req.query;
      if (!owner_id || !reminder_date) {
        return res.status(400).json({ message: "Missing owner_id or reminder_date" });
      }
      const reminders = await ReminderModel.getReminderByDate(owner_id, reminder_date);
      res.status(200).json({ data: reminders });
    } catch (err) {
      console.error("Get reminders error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  static async deleteReminder(req, res) {
    try {
      const { reminder_id } = req.params;
      if (!reminder_id) {
        return res.status(400).json({ message: "Missing reminder_id" });
      }
      await ReminderModel.deleteReminderById(reminder_id);
      res.status(200).json({ message: "Reminder deleted" });
    } catch (err) {
      console.error("Delete reminder error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  static async getRemindersByMonthYear(req, res) {
    try {
      const { owner_id, year, month } = req.query;
      if (!owner_id || !year || !month) {
        return res.status(400).json({ message: "Missing owner_id, year, or month" });
      }
      const reminders = await ReminderModel.getReminderByMonthYear(owner_id, parseInt(year), parseInt(month));
      res.status(200).json({ data: reminders });
    } catch (err) {
      console.error("Get month reminders error:", err);
      res.status(500).json({ message: err.message });
    }
  }

  static async getUpcomingReminders(req, res) {
    try {
      const { owner_id, days_ahead } = req.query;
      if (!owner_id) {
        return res.status(400).json({ message: "Missing owner_id" });
      }
      const daysAhead = parseInt(days_ahead) || 90;
      const reminders = await ReminderModel.getUpcomingReminders(owner_id, daysAhead);
      res.status(200).json({ data: reminders });
    } catch (err) {
      console.error("Get upcoming reminders error:", err);
      res.status(500).json({ message: err.message });
    }
  }
}
