import express from "express"
import { MedicalRecordController } from "../controllers/MedicalRecordController.js"
import { upload } from "../config/multer.js"

const router = express.Router()

router.post("/", upload.single('record_image'), MedicalRecordController.createRecord)
router.get("/", MedicalRecordController.getAllRecords)
router.get("/pet/:pet_id", MedicalRecordController.getRecordsByPet)
router.get("/:record_id", MedicalRecordController.getRecord)
router.patch("/:record_id", upload.single('record_image'), MedicalRecordController.updateRecord)
router.delete("/:record_id", MedicalRecordController.deleteRecord)

export default router
