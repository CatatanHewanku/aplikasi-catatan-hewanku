import { ReminderModel } from "../models/ReminderModel.js";

export class ReminderController {
  // Create a new reminder
  static async createReminder(req, res) {
    try {
      const { owner_id, reminder_date, reminder_title, reminder_time, reminder_category } = req.body;
      if (!owner_id || !reminder_date || !reminder_title || !reminder_time) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const reminder = await ReminderModel.createReminder(owner_id, reminder_date, reminder_title, reminder_time, reminder_category || null);
      res.status(201).json({ message: "Reminder created", data: reminder });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // Get reminders by date
  static async getRemindersByDate(req, res) {
    try {
      const { owner_id, reminder_date } = req.query;
      if (!owner_id || !reminder_date) {
        return res.status(400).json({ message: "Missing owner_id or reminder_date" });
      }
      const reminders = await ReminderModel.getReminderByDate(owner_id, reminder_date);
      res.status(200).json({ data: reminders });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // (Optional) Delete reminder by ID
  static async deleteReminder(req, res) {
    try {
      const { reminder_id } = req.params;
      if (!reminder_id) {
        return res.status(400).json({ message: "Missing reminder_id" });
      }
      await ReminderModel.deleteReminderById(reminder_id);
      res.status(200).json({ message: "Reminder deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}
