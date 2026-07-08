import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import { Readable } from 'stream'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})


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


export const deleteFromCloudinary = async (cloudinaryUrl) => {
  try {
    if (!cloudinaryUrl) return

    const parts = cloudinaryUrl.split('catatanhewanku/')

    if (parts.length > 1) {
      const specificPath = parts[1].split('.')[0]
      const fullPublicId = `catatanhewanku/${specificPath}`

      await cloudinary.uploader.destroy(fullPublicId, { resource_type: 'image' })
    }
  } catch (err) {
    console.warn(`Cloudinary delete warning (non-critical): ${err.message}`)
  }
}

export { cloudinary }
