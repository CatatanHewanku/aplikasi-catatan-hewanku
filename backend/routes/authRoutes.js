import express from "express"
import { AuthController } from "../controllers/AuthController.js"

const router = express.Router()

// Auth routes
router.post("/forgot-password", AuthController.forgotPassword)
router.post("/verify-code", AuthController.verifyCode)
router.post("/reset-password", AuthController.resetPassword)

export default router
