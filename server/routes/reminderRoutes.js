import express from "express"
import { ReminderController } from "../controllers/ReminderController.js"

const router = express.Router()

router.post("/", ReminderController.createReminder)
router.get("/", ReminderController.getRemindersByDate)
router.delete("/:reminder_id", ReminderController.deleteReminder)

export default router
