import express from "express"
import { ReminderController } from "../controllers/ReminderController.js"

const router = express.Router()

router.get("/month", ReminderController.getRemindersByMonthYear)
router.get("/upcoming", ReminderController.getUpcomingReminders)
router.post("/", ReminderController.createReminder)
router.get("/", ReminderController.getRemindersByDate)
router.patch("/:reminder_id", ReminderController.updateReminder)
router.delete("/:reminder_id", ReminderController.deleteReminder)

export default router
