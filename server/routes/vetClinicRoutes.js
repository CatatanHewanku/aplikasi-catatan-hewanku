import express from "express"
import { VetClinicController } from "../controllers/VetClinicController.js"

const router = express.Router()

router.post("/", VetClinicController.createClinic)
router.get("/", VetClinicController.getAllClinics)
router.get("/search", VetClinicController.searchClinics)
router.get("/:clinic_id", VetClinicController.getClinic)
router.patch("/:clinic_id", VetClinicController.updateClinic)

router.get("/quota/info", VetClinicController.getQuota)
router.post("/sync/manual", VetClinicController.manualSyncGoogle)

router.post("/nearby", VetClinicController.getClinicsByDistance)

export default router
