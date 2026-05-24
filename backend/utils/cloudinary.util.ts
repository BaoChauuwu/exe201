import { v2 as cloudinary } from 'cloudinary'
import { config } from 'dotenv'
config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string
})

/**
 * Upload ảnh từ Buffer lên Cloudinary
 * @param buffer  - Buffer của file ảnh
 * @param folder  - Thư mục lưu trên Cloudinary (vd: 'experiences/buddyId')
 * @returns secure_url và public_id của ảnh vừa upload
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<{ url: string; publicId: string }> {
  if (!process.env.CLOUDINARY_API_KEY) {
    console.warn('⚠️ No CLOUDINARY_API_KEY found, using mock image URL.')
    return { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000', publicId: `mock_${Date.now()}` }
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'image'
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Upload thất bại'))
          resolve({ url: result.secure_url, publicId: result.public_id })
        }
      )
      .end(buffer)
  })
}

/**
 * Xóa ảnh trên Cloudinary theo public_id
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!process.env.CLOUDINARY_API_KEY || publicId.startsWith('mock_')) {
    return
  }
  await cloudinary.uploader.destroy(publicId)
}

/**
 * Trích xuất public_id từ Cloudinary URL
 * VD: https://res.cloudinary.com/demo/image/upload/v123/experiences/abc/img.jpg
 *  → experiences/abc/img
 */
export function extractCloudinaryPublicId(url: string): string {
  // Tìm phần sau /upload/vXXXX/
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/)
  return match ? match[1] : url
}
