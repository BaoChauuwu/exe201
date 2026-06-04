import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { ErrorWithStatus } from '~/utils/errors'
import httpStatus from '~/constants/httpStatus'
import BookingModel from '~/models/Booking.model'
import { TokenPayload } from '~/models/requests/User.requests'

// -----------------------------------------------------------------------
// Validator: POST /payment/create-url
// Kiểm tra body gửi lên từ Frontend trước khi vào controller
// -----------------------------------------------------------------------
export const createPaymentUrlValidator = validate(
  checkSchema(
    {
      bookingId: {
        notEmpty: {
          errorMessage: 'bookingId không được để trống.'
        },
        isString: {
          errorMessage: 'bookingId phải là chuỗi.'
        },
        trim: true,
        // Kiểm tra booking tồn tại trong DB và thuộc về user đang đăng nhập
        custom: {
          options: async (value: string, { req }) => {
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
                message: 'Bạn không có quyền thanh toán cho booking này.',
                status: httpStatus.FORBIDDEN
              })
            }

            if (booking.paymentStatus === 'paid') {
              throw new ErrorWithStatus({
                message: 'Booking này đã được thanh toán rồi.',
                status: httpStatus.BAD_REQUEST
              })
            }

            // Đính kèm booking vào req để controller dùng lại, tránh query DB 2 lần
            req.booking = booking
            return true
          }
        }
      },
      orderDescription: {
        optional: true,
        isString: {
          errorMessage: 'orderDescription phải là chuỗi.'
        },
        isLength: {
          options: { max: 255 },
          errorMessage: 'orderDescription tối đa 255 ký tự.'
        },
        trim: true
      },
      bankCode: {
        optional: true,
        isString: {
          errorMessage: 'bankCode phải là chuỗi.'
        },
        trim: true
      }
    },
    ['body']
  )
)
