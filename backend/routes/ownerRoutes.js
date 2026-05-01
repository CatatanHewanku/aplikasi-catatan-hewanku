import express from "express"
import { OwnerController } from "../controllers/OwnerController.js"

const router = express.Router()

// Owner routes
router.post("/", OwnerController.createOwner)
router.get("/", OwnerController.getAllOwners)
router.get("/email/:owner_email", OwnerController.getOwnerByEmail)
router.get("/phone/:owner_phone_number", OwnerController.getOwnerByPhone)
router.get("/:owner_id", OwnerController.getOwner)
router.patch("/:owner_id", OwnerController.updateOwner)
router.delete("/:owner_id", OwnerController.deleteOwner)

export default router
