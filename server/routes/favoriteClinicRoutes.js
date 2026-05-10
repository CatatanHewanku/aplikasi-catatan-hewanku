import express from "express"
import { FavoriteClinicController } from "../controllers/FavoriteClinicController.js"

const router = express.Router()

// Favorite clinic routes
router.post("/", FavoriteClinicController.addFavorite)
router.get("/owner/:owner_id", FavoriteClinicController.getFavorites)
router.delete("/", FavoriteClinicController.removeFavorite)
router.get("/check/:owner_id/:clinic_id", FavoriteClinicController.checkFavorite)

export default router
