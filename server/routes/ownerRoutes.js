import express from "express"
import { OwnerController } from "../controllers/OwnerController.js"
import { upload } from "../config/multer.js"

const router = express.Router()

router.post("/", OwnerController.createOwner)
router.get("/", OwnerController.getAllOwners)
router.get("/email/:owner_email", OwnerController.getOwnerByEmail)
router.get("/phone/:owner_phone_number", OwnerController.getOwnerByPhone)
router.get("/:owner_id", OwnerController.getOwner)
router.patch("/:owner_id", upload.single('image'), OwnerController.updateOwner)
router.post("/:owner_id/upload-image", upload.single('image'), OwnerController.uploadOwnerImage)
router.delete("/:owner_id", OwnerController.deleteOwner)

export default router
