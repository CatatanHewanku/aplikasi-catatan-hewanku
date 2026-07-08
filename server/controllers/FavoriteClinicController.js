import { FavoriteClinicModel } from "../models/FavoriteClinicModel.js"

export class FavoriteClinicController {
  static async addFavorite(req, res) {
    try {
      const { owner_id, clinic_id } = req.body

      if (!owner_id || !clinic_id) {
        return res.status(400).json({ message: "owner_id and clinic_id are required" })
      }

      const result = await FavoriteClinicModel.addFavorite(owner_id, clinic_id)
      res.status(201).json({ message: "Clinic added to favorites", data: result })
    } catch (err) {
      if (err.message.includes('Maximum 3')) {
        return res.status(400).json({ message: err.message })
      }
      if (err.message.includes('already favorited')) {
        return res.status(409).json({ message: err.message })
      }
      res.status(500).json({ message: err.message })
    }
  }

  static async getFavorites(req, res) {
    try {
      const { owner_id } = req.params

      if (!owner_id) {
        return res.status(400).json({ message: "owner_id is required" })
      }

      const favorites = await FavoriteClinicModel.getFavoritesByOwner(owner_id)
      res.status(200).json({ message: "Favorite clinics retrieved", data: favorites })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async removeFavorite(req, res) {
    try {
      const { owner_id, clinic_id } = req.body

      if (!owner_id || !clinic_id) {
        return res.status(400).json({ message: "owner_id and clinic_id are required" })
      }

      const result = await FavoriteClinicModel.removeFavorite(owner_id, clinic_id)
      res.status(200).json({ message: "Clinic removed from favorites", data: result })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }

  static async checkFavorite(req, res) {
    try {
      const { owner_id, clinic_id } = req.params

      if (!owner_id || !clinic_id) {
        return res.status(400).json({ message: "owner_id and clinic_id are required" })
      }

      const isFavorited = await FavoriteClinicModel.isFavorited(owner_id, clinic_id)
      res.status(200).json({ message: "Check complete", data: { is_favorited: isFavorited } })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }
}
