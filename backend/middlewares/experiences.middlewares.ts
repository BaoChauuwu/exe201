import multer from 'multer'
import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { ErrorWithStatus } from '~/utils/errors'
import httpStatus from '~/constants/httpStatus'

// ─── Multer ────────────────────────────────────────────────────────────────

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES, files: 5 },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new ErrorWithStatus({
        message: 'Chỉ chấp nhận ảnh jpeg, png, webp',
        status: httpStatus.BAD_REQUEST
      }) as unknown as Error)
    }
    cb(null, true)
  }
}).array('images', 5)

// ─── Validators ────────────────────────────────────────────────────────────

export const createExperienceValidator = validate(
  checkSchema(
    {
      title: {
        notEmpty: { errorMessage: 'Tiêu đề không được để trống' },
        isString: true,
        isLength: { options: { min: 5, max: 200 }, errorMessage: 'Tiêu đề phải từ 5–200 ký tự' },
        trim: true
      },
      description: {
        notEmpty: { errorMessage: 'Mô tả không được để trống' },
        isString: true,
        isLength: { options: { min: 10, max: 2000 }, errorMessage: 'Mô tả phải từ 10–2000 ký tự' },
        trim: true
      },
      category: {
        notEmpty: { errorMessage: 'Category không được để trống' },
        isIn: {
          options: [['food', 'adventure', 'culture', 'nightlife', 'other']],
          errorMessage: 'Category phải là: food | adventure | culture | nightlife | other'
        }
      },
      city: {
        optional: true,
        isString: true,
        trim: true
      },
      currency: {
        optional: true,
        isString: true,
        trim: true
      },
      minHours: {
        optional: true,
        isFloat: { options: { min: 0.5 }, errorMessage: 'minHours phải >= 0.5' },
        toFloat: true
      },
      price: {
        notEmpty: { errorMessage: 'Giá không được để trống' },
        isFloat: { options: { min: 0 }, errorMessage: 'Giá phải >= 0' },
        toFloat: true
      },
      maxGroupSize: {
        optional: true,
        isInt: { options: { min: 1 }, errorMessage: 'maxGroupSize phải >= 1' },
        toInt: true
      },
      meetingPointLng: {
        notEmpty: { errorMessage: 'Kinh độ không được để trống' },
        isFloat: {
          options: { min: 102.0, max: 110.0 },
          errorMessage: 'Kinh độ phải trong khu vực Việt Nam'
        },
        toFloat: true
      },
      meetingPointLat: {
        notEmpty: { errorMessage: 'Vĩ độ không được để trống' },
        isFloat: {
          options: { min: 8.0, max: 24.0 },
          errorMessage: 'Vĩ độ phải trong khu vực Việt Nam'
        },
        toFloat: true
      }
    },
    ['body']
  )
)

export const updateExperienceValidator = validate(
  checkSchema(
    {
      title: {
        optional: true,
        isString: true,
        isLength: { options: { min: 5, max: 200 }, errorMessage: 'Tiêu đề phải từ 5–200 ký tự' },
        trim: true
      },
      description: {
        optional: true,
        isString: true,
        isLength: { options: { min: 10, max: 2000 }, errorMessage: 'Mô tả phải từ 10–2000 ký tự' },
        trim: true
      },
      category: {
        optional: true,
        isIn: {
          options: [['food', 'adventure', 'culture', 'nightlife', 'other']],
          errorMessage: 'Category phải là: food | adventure | culture | nightlife | other'
        }
      },
      city: {
        optional: true,
        isString: true,
        trim: true
      },
      currency: {
        optional: true,
        isString: true,
        trim: true
      },
      minHours: {
        optional: true,
        isFloat: { options: { min: 0.5 }, errorMessage: 'minHours phải >= 0.5' },
        toFloat: true
      },
      price: {
        optional: true,
        isFloat: { options: { min: 0 }, errorMessage: 'Giá phải >= 0' },
        toFloat: true
      },
      maxGroupSize: {
        optional: true,
        isInt: { options: { min: 1 }, errorMessage: 'maxGroupSize phải >= 1' },
        toInt: true
      },
      meetingPointLng: {
        optional: true,
        isFloat: {
          options: { min: 102.0, max: 110.0 },
          errorMessage: 'Kinh độ phải trong khu vực Việt Nam'
        },
        toFloat: true
      },
      meetingPointLat: {
        optional: true,
        isFloat: {
          options: { min: 8.0, max: 24.0 },
          errorMessage: 'Vĩ độ phải trong khu vực Việt Nam'
        },
        toFloat: true
      },
      isActive: {
        optional: true,
        isBoolean: { errorMessage: 'isActive phải là boolean' },
        toBoolean: true
      }
    },
    ['body']
  )
)
