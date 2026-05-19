import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import { Readable } from 'stream'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * Upload file to Cloudinary
 * @param {Object} file - Multer file object
 * @param {string} folder - Cloudinary folder path
 * @returns {Object} Upload result with secure_url
 */
export const uploadToCloudinary = async (file, folder = 'catatanhewanku') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )

      Readable.from(file.buffer).pipe(uploadStream)
    })
  } catch (err) {
    throw new Error(`Cloudinary upload failed: ${err.message}`)
  }
}

/**
 * Delete file from Cloudinary by URL
 * @param {string} cloudinaryUrl - Full Cloudinary URL
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (cloudinaryUrl) => {
  try {
    if (!cloudinaryUrl) return

    // Split the URL right at your root folder name
    const parts = cloudinaryUrl.split('catatanhewanku/')

    if (parts.length > 1) {
      // Get the rest of the path (e.g., "pets/abc123xyz.jpg") and remove the extension
      const specificPath = parts[1].split('.')[0]

      // Rebuild the exact public_id Cloudinary needs
      const fullPublicId = `catatanhewanku/${specificPath}`

      await cloudinary.uploader.destroy(fullPublicId, { resource_type: 'image' })
    }
  } catch (err) {
    // The helper absorbs the error so your main app doesn't crash
    console.warn(`Cloudinary delete warning (non-critical): ${err.message}`)
  }
}

export { cloudinary }
