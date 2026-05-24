import { Router } from 'express'
import {
    createBookingController,
    payBookingController,
    payBookingWithWalletController,
    completeBookingController,
    cancelBookingController,
    getMyBookingsController,
    getBookingByIdController
} from '../controllers/bookings.controllers'
import { accessTokenValidator } from '../middlewares/users.middlewares'
import { wrapRequestHandler } from '../utils/handlers'

const bookingsRouter = Router()

// Áp dụng accessTokenValidator cho toàn bộ các API đặt lịch
bookingsRouter.use(accessTokenValidator)

// 1. Tạo Booking mới (Chỉ dành cho Tourist hoặc Buddy, thực tế bất kỳ ai cũng có thể đặt, nhưng khuyến khích chỉ Tourist được đặt trực tiếp)
bookingsRouter.post(
    '/',
    wrapRequestHandler(createBookingController)
)

// 2. Lấy danh sách booking của cá nhân (Tourist thấy tour đã đặt, Buddy thấy tour sắp dẫn)
bookingsRouter.get(
    '/my',
    wrapRequestHandler(getMyBookingsController)
)

// 3. Lấy chi tiết booking
bookingsRouter.get(
    '/:id',
    wrapRequestHandler(getBookingByIdController)
)

// 4. Thanh toán Booking (giả lập)
bookingsRouter.post(
    '/:id/pay',
    wrapRequestHandler(payBookingController)
)

// 4.2. Thanh toán Booking bằng số dư Ví (giả lập)
bookingsRouter.post(
    '/:id/pay-with-wallet',
    wrapRequestHandler(payBookingWithWalletController)
)

// 5. Xác nhận hoàn thành Booking (Buddy hoặc Admin bấm để giải ngân)
bookingsRouter.post(
    '/:id/complete',
    wrapRequestHandler(completeBookingController)
)

// 6. Hủy Booking (Tourist, Buddy hoặc Admin bấm, áp dụng luật 24h)
bookingsRouter.post(
    '/:id/cancel',
    wrapRequestHandler(cancelBookingController)
)

export default bookingsRouter
