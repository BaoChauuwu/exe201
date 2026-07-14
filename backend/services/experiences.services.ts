import { ObjectId } from 'mongodb'
import ExperienceModel from '~/models/Experience.model'
import { uploadToCloudinary, deleteFromCloudinary, extractCloudinaryPublicId } from '~/utils/cloudinary.util'
import { ErrorWithStatus } from '~/utils/errors'
import httpStatus from '~/constants/httpStatus'
import { CreateExperienceRequestBody, UpdateExperienceRequestBody } from '~/models/requests/Experience.requests'

class ExperiencesService {
  async createExperience(buddyId: string, body: CreateExperienceRequestBody, files: Express.Multer.File[]) {
    const imageUrls: string[] = []

    // Đọc các URL ảnh đã upload từ Frontend
    const keepImagesRaw = (body as any).keepImages ?? (body as any)['keepImages[]'] ?? []
    const keepImages = Array.isArray(keepImagesRaw)
      ? keepImagesRaw
      : typeof keepImagesRaw === 'string'
        ? [keepImagesRaw]
        : []
    imageUrls.push(...keepImages)

    for (const file of files) {
      const { url } = await uploadToCloudinary(file.buffer, `experiences/${buddyId}`)
      imageUrls.push(url)
    }

    const minHours = body.minHours ?? 1
    const price = body.price ?? 0

    const experience = await ExperienceModel.create({
      buddyId: new ObjectId(buddyId),
      title: body.title,
      description: body.description,
      category: body.category,
      city: body.city ?? 'Da Nang',
      price: price,
      currency: body.currency ?? 'VND',
      minHours: minHours,
      maxGroupSize: body.maxGroupSize ?? 1,
      includedItems: (() => {
        const raw = body.includedItems ?? body['includedItems[]'] ?? []
        return Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : []
      })(),
      images: imageUrls,
      meetingPoint: {
        type: 'Point',
        coordinates: [body.meetingPointLng, body.meetingPointLat]
      },
      isApproved: false,
      status: 'pending'
    })

    return experience
  }

  async updateExperience(
    experienceId: string,
    buddyId: string,
    body: UpdateExperienceRequestBody,
    files: Express.Multer.File[]
  ) {
    const experience = await ExperienceModel.findById(experienceId)

    if (!experience) {
      throw new ErrorWithStatus({ message: 'Tour không tồn tại', status: httpStatus.NOT_FOUND })
    }

    if (experience.buddyId.toString() !== buddyId) {
      throw new ErrorWithStatus({
        message: 'Bạn không có quyền chỉnh sửa tour này',
        status: httpStatus.FORBIDDEN
      })
    }

    const currentImages = experience.images ?? []
    const hasImagesUpdate = (body as any).keepImages !== undefined || (body as any)['keepImages[]'] !== undefined || files.length > 0
    let imagesChanged = false

    if (hasImagesUpdate) {
      // 1. Phân tích ảnh cũ được giữ lại từ request body
      const keepImagesRaw = (body as any).keepImages ?? (body as any)['keepImages[]'] ?? []
      const keepImages = Array.isArray(keepImagesRaw)
        ? keepImagesRaw
        : typeof keepImagesRaw === 'string'
          ? [keepImagesRaw]
          : []

      // 2. Tìm những ảnh cũ bị loại bỏ khỏi danh sách giữ lại để xóa trên Cloudinary
      const imagesToDelete = currentImages.filter((img) => !keepImages.includes(img))
      for (const oldUrl of imagesToDelete) {
        const publicId = extractCloudinaryPublicId(oldUrl)
        await deleteFromCloudinary(publicId).catch(() => null) // Bỏ qua lỗi xóa ảnh cũ
      }

      // 3. Upload các file mới lên Cloudinary (nếu có)
      const newImageUrls: string[] = []
      for (const file of files) {
        const { url } = await uploadToCloudinary(file.buffer, `experiences/${buddyId}`)
        newImageUrls.push(url)
      }

      // 4. Gán lại mảng ảnh cuối cùng (gồm các ảnh cũ giữ lại và ảnh mới tải lên)
      experience.images = [...keepImages, ...newImageUrls]
      experience.markModified('images')

      const finalImages = experience.images ?? []
      imagesChanged =
        currentImages.length !== finalImages.length ||
        currentImages.some((img, idx) => img !== finalImages[idx])
    }

    if (body.title !== undefined) experience.title = body.title
    if (body.description !== undefined) experience.description = body.description
    if (body.category !== undefined) experience.category = body.category
    if (body.city !== undefined) experience.city = body.city
    if (body.currency !== undefined) experience.currency = body.currency
    if (body.minHours !== undefined) experience.minHours = body.minHours
    if (body.price !== undefined) experience.price = body.price

    if (body.maxGroupSize !== undefined) experience.maxGroupSize = body.maxGroupSize
    if (body.isActive !== undefined) experience.isActive = body.isActive

    // 5. Cập nhật các vật phẩm bao gồm (nếu có)
    const includedItemsRaw = body.includedItems ?? body['includedItems[]']
    if (includedItemsRaw !== undefined) {
      experience.includedItems = Array.isArray(includedItemsRaw)
        ? includedItemsRaw
        : typeof includedItemsRaw === 'string'
          ? [includedItemsRaw]
          : []
      experience.markModified('includedItems')
    }

    if (body.meetingPointLng !== undefined && body.meetingPointLat !== undefined) {
      experience.meetingPoint = {
        type: 'Point',
        coordinates: [body.meetingPointLng, body.meetingPointLat]
      }
    }

    const isCriticalUpdate =
      body.title !== undefined ||
      body.description !== undefined ||
      body.category !== undefined ||
      body.city !== undefined ||
      body.price !== undefined ||
      body.currency !== undefined ||
      body.minHours !== undefined ||
      body.maxGroupSize !== undefined ||
      includedItemsRaw !== undefined ||
      (body.meetingPointLng !== undefined && body.meetingPointLat !== undefined) ||
      imagesChanged

    if (isCriticalUpdate) {
      experience.status = 'pending'
      experience.isApproved = false
    }

    await experience.save()
    return experience
  }

  async getMyExperiences(buddyId: string) {
    return ExperienceModel.find({ buddyId: new ObjectId(buddyId) }).sort({ created_at: -1 })
  }

  async getExperienceById(experienceId: string) {
    const experience = await ExperienceModel.findById(experienceId)

    if (!experience) {
      throw new ErrorWithStatus({ message: 'Tour không tồn tại', status: httpStatus.NOT_FOUND })
    }

    return experience
  }

  async getExperiencesByBuddyId(buddyId: string) {
    let queryBuddyId: any = buddyId
    if (ObjectId.isValid(buddyId)) {
      queryBuddyId = new ObjectId(buddyId)
    }
    const BuddyProfileModel = require('~/models/BuddyProfile.model').default
    let targetUserId = queryBuddyId
    try {
      const profile = await BuddyProfileModel.findOne({
        $or: [{ _id: queryBuddyId }, { userId: queryBuddyId }]
      })
      if (profile && profile.userId) {
        targetUserId = profile.userId
      }
    } catch (e) {
      // ignore
    }

    return ExperienceModel.find({
      $or: [
        { buddyId: targetUserId },
        { buddyId: queryBuddyId }
      ],
      isActive: true
    }).sort({ created_at: -1 })
  }

  async getAllExperiences() {
    return ExperienceModel.find({
      $or: [
        { status: 'approved' },
        { isApproved: true }
      ],
      isActive: true
    }).sort({ created_at: -1 })
  }
}

const experiencesService = new ExperiencesService()
export default experiencesService
