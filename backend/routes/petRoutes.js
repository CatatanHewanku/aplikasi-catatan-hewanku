import express from "express"
import { PetController } from "../controllers/PetController.js"
import { upload } from "../config/multer.js"

const router = express.Router()

// Pet routes
router.post("/", upload.single('pet_image'), PetController.createPet)
router.get("/owner/:owner_id", PetController.getPetsByOwner)
router.get("/:pet_id", PetController.getPet)
router.patch("/:pet_id", upload.single('pet_image'), PetController.updatePet)
router.delete("/:pet_id", PetController.deletePet)

export default router
