import { Router } from 'express'
import {
    createBookingController,
    payBookingController,
    payBookingWithWalletController,
    completeBookingController,
    cancelBookingController,
    getMyBookingsController,
    getBookingByIdController,
    getTouristBookingsController,
    getBuddyBookingsController,
    startBookingController,
    touristCompleteBookingController,
    raiseDisputeController,
    submitBuddyDefenseController,
    resolveDisputeController,
    getDisputesController,
    releaseEscrowController
} from '../controllers/bookings.controllers'
import { accessTokenValidator } from '../middlewares/users.middlewares'
import { 
    getTouristBookingsValidator, 
    getBuddyBookingsValidator,
    startBookingValidator,
    touristCompleteBookingValidator
} from '../middlewares/bookings.middlewares'
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

// 5.2. Tourist xác nhận hoàn thành chuyến đi để giải ngân tiền
bookingsRouter.post(
    '/:id/tourist-complete',
    touristCompleteBookingValidator,
    wrapRequestHandler(touristCompleteBookingController)
)

// 6. Hủy Booking (Tourist, Buddy hoặc Admin bấm, áp dụng luật 24h)
bookingsRouter.post(
    '/:id/cancel',
    wrapRequestHandler(cancelBookingController)
)

// 6.2. Buddy check-in bắt đầu chuyến đi
bookingsRouter.post(
    '/:id/start',
    startBookingValidator,
    wrapRequestHandler(startBookingController)
)

// 7. Lấy danh sách chuyến đi thành công của Tourist
bookingsRouter.get(
    '/tourist/:touristId',
    getTouristBookingsValidator,
    wrapRequestHandler(getTouristBookingsController)
)

// 8. Lấy danh sách chuyến đi thành công của Buddy
bookingsRouter.get(
    '/buddy/:buddyId',
    getBuddyBookingsValidator,
    wrapRequestHandler(getBuddyBookingsController)
)

// 9. Tourist gửi khiếu nại (Dispute) - Đóng băng Escrow
bookingsRouter.post(
    '/:id/dispute',
    accessTokenValidator,
    wrapRequestHandler(raiseDisputeController)
)

// 9.5 Buddy gửi giải trình khiếu nại
bookingsRouter.post(
    '/:id/dispute/defense',
    accessTokenValidator,
    wrapRequestHandler(submitBuddyDefenseController)
)

// 10. Admin giải quyết khiếu nại
bookingsRouter.post(
    '/:id/resolve-dispute',
    wrapRequestHandler(resolveDisputeController)
)

// 11. Admin xem danh sách khiếu nại
bookingsRouter.get(
    '/admin/disputes',
    wrapRequestHandler(getDisputesController)
)

// 12. Admin giải ngân Escrow thủ công
bookingsRouter.post(
    '/admin/release-escrow',
    wrapRequestHandler(releaseEscrowController)
)

export default bookingsRouter
