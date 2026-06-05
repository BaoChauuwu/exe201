import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/utils/errors'
import httpStatus from '~/constants/httpStatus'
import BookingModel from '~/models/Booking.model'
import { TokenPayload } from '~/models/requests/User.requests'

export const getTouristBookingsValidator = validate(
  checkSchema(
    {
      touristId: {
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: 'ID Tourist không hợp lệ.',
                status: httpStatus.BAD_REQUEST
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const getBuddyBookingsValidator = validate(
  checkSchema(
    {
      buddyId: {
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: 'ID Buddy không hợp lệ.',
                status: httpStatus.BAD_REQUEST
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const startBookingValidator = validate(
  checkSchema(
    {
      id: {
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

            const { user_id } = req.decoded_authorization as TokenPayload
            if (booking.buddyId.toString() !== user_id) {
              throw new ErrorWithStatus({
                message: 'Bạn không có quyền bắt đầu chuyến đi này (Chỉ dành cho Buddy dẫn tour).',
                status: httpStatus.FORBIDDEN
              })
            }

            if (booking.paymentStatus !== 'paid') {
              throw new ErrorWithStatus({
                message: 'Chuyến đi chưa được thanh toán.',
                status: httpStatus.BAD_REQUEST
              })
            }

            if (booking.status !== 'confirmed') {
              if (booking.status === 'ongoing') {
                throw new ErrorWithStatus({
                  message: 'Chuyến đi này đã được bắt đầu từ trước.',
                  status: httpStatus.BAD_REQUEST
                })
              }
              throw new ErrorWithStatus({
                message: 'Trạng thái chuyến đi không hợp lệ để khởi hành.',
                status: httpStatus.BAD_REQUEST
              })
            }

            // Đính kèm booking để controller sử dụng trực tiếp
            ;(req as any).booking = booking
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const touristCompleteBookingValidator = validate(
  checkSchema(
    {
      id: {
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

            const { user_id } = req.decoded_authorization as TokenPayload
            if (booking.touristId.toString() !== user_id) {
              throw new ErrorWithStatus({
                message: 'Bạn không có quyền xác nhận hoàn thành chuyến đi này (Chỉ dành cho Tourist đặt tour).',
                status: httpStatus.FORBIDDEN
              })
            }

            if (booking.status !== 'ongoing') {
              throw new ErrorWithStatus({
                message: 'Chuyến đi chưa được bắt đầu hoặc đã kết thúc.',
                status: httpStatus.BAD_REQUEST
              })
            }

            // Đính kèm booking để controller sử dụng trực tiếp
            ;(req as any).booking = booking
            return true
          }
        }
      }
    },
    ['params']
  )
)
