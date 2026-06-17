import express from "express"
import { PetController } from "../controllers/PetController.js"
import { upload } from "../config/multer.js"
import { verifyToken } from "../middleware/authMiddleware.js"

const router = express.Router()

// Pet routes
router.post("/", verifyToken, upload.single('pet_image'), PetController.createPet)
router.get("/owner/:owner_id", verifyToken, PetController.getPetsByOwner)
router.get("/:pet_id", verifyToken, PetController.getPet)
router.patch("/:pet_id", verifyToken, upload.single('pet_image'), PetController.updatePet)
router.delete("/:pet_id", verifyToken, PetController.deletePet)

export default router