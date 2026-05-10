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

    // Extract public_id from URL
    // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{public_id}.{ext}
    const urlParts = cloudinaryUrl.split('/')
    const filename = urlParts[urlParts.length - 1]
    const publicId = filename.split('.')[0]

    // Try to delete with folder path first
    const folder = urlParts[urlParts.length - 2]
    const fullPublicId = `${folder}/${publicId}`

    await cloudinary.uploader.destroy(fullPublicId, { resource_type: 'image' })
  } catch (err) {
    console.warn(`Cloudinary delete warning (non-critical): ${err.message}`)
    // Don't throw - deletion failures shouldn't block operations
  }
}

export { cloudinary }
