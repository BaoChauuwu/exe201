import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/utils/errors'
import httpStatus from '~/constants/httpStatus'
import BookingModel from '~/models/Booking.model'
import ReviewModel from '~/models/Review.model'
import { TokenPayload } from '~/models/requests/User.requests'

export const createReviewValidator = validate(
  checkSchema(
    {
      bookingId: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: 'Mã đặt lịch không hợp lệ.',
                status: httpStatus.BAD_REQUEST
              })
            }

            const booking = await BookingModel.findById(value)
            if (!booking) {
              throw new ErrorWithStatus({
                message: 'Không tìm thấy thông tin đặt tour.',
                status: httpStatus.NOT_FOUND
              })
            }

            if (booking.status !== 'completed') {
              throw new ErrorWithStatus({
                message: 'Chuyến đi chưa hoàn thành, không thể đánh giá.',
                status: httpStatus.BAD_REQUEST
              })
            }

            const { user_id } = req.decoded_authorization as TokenPayload
            const isTourist = booking.touristId.toString() === user_id
            const isBuddy = booking.buddyId.toString() === user_id

            if (!isTourist && !isBuddy) {
              throw new ErrorWithStatus({
                message: 'Bạn không có quyền đánh giá chuyến đi này.',
                status: httpStatus.FORBIDDEN
              })
            }

            // Kiểm tra xem đã đánh giá chưa
            const existingReview = await ReviewModel.findOne({
              bookingId: new ObjectId(value),
              reviewerId: new ObjectId(user_id)
            })

            if (existingReview) {
              throw new ErrorWithStatus({
                message: 'Bạn đã gửi đánh giá cho chuyến đi này rồi.',
                status: httpStatus.BAD_REQUEST
              })
            }

            // Đính kèm booking để controller dùng trực tiếp
            ;(req as any).booking = booking
            return true
          }
        }
      },
      rating: {
        isInt: {
          options: { min: 1, max: 5 },
          errorMessage: 'Điểm đánh giá phải là số nguyên từ 1 đến 5.'
        }
      },
      comment: {
        optional: true,
        isString: {
          errorMessage: 'Bình luận phải là chuỗi ký tự.'
        }
      }
    },
    ['body']
  )
)
