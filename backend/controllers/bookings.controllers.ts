import { Request, Response } from 'express'
import httpStatus from '../constants/httpStatus'
import { TokenPayload } from '../models/requests/User.requests'
import bookingsService from '../services/bookings.services'
import databaseService from '../services/database.services'
import { ObjectId } from 'mongodb'

// 1. Tourist tạo Booking mới
export const createBookingController = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.decoded_authorization as TokenPayload
        const { experienceId, scheduledDate, startTime, hours, groupSize, refundBankInfo } = req.body

        const booking = await bookingsService.createBooking({
            touristId: user_id,
            experienceId,
            scheduledDate,
            startTime,
            hours,
            groupSize,
            refundBankInfo
        })

        return res.status(httpStatus.CREATED).json({
            message: 'Tạo đặt tour thành công. Vui lòng tiến hành thanh toán.',
            result: booking
        })
    } catch (error: any) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: error.message || 'Tạo đặt tour thất bại.'
        })
    }
}

// 2. Thanh toán Booking (giả lập)
export const payBookingController = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.decoded_authorization as TokenPayload
        const { id } = req.params
        const { paymentMethod } = req.body

        const booking = await bookingsService.processPayment(id as string, user_id, paymentMethod)

        return res.status(httpStatus.OK).json({
            message: 'Thanh toán tour thành công!',
            result: booking
        })
    } catch (error: any) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: error.message || 'Thanh toán tour thất bại.'
        })
    }
}

// 2.2. Thanh toán Booking bằng số dư Ví (giả lập)
export const payBookingWithWalletController = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.decoded_authorization as TokenPayload
        const { id } = req.params

        const booking = await bookingsService.payWithWallet(id as string, user_id)

        return res.status(httpStatus.OK).json({
            message: 'Thanh toán bằng số dư Ví thành công!',
            result: booking
        })
    } catch (error: any) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: error.message || 'Thanh toán bằng ví thất bại.'
        })
    }
}

// 3. Buddy/Admin hoàn thành Booking
export const completeBookingController = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.decoded_authorization as TokenPayload
        const { id } = req.params

        // Truy vấn user để lấy role
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Không tìm thấy tài khoản người dùng.' })
        }

        const booking = await bookingsService.completeBooking(id as string, user_id, user.role || 'buddy')

        return res.status(httpStatus.OK).json({
            message: 'Đã xác nhận chuyến đi hoàn thành thành công và giải ngân thu nhập!',
            result: booking
        })
    } catch (error: any) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: error.message || 'Không thể xác nhận hoàn thành chuyến đi.'
        })
    }
}

// 4. Hủy Booking (Áp dụng chính sách 24h)
export const cancelBookingController = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.decoded_authorization as TokenPayload
        const { id } = req.params
        const { cancelReason } = req.body

        // Truy vấn user để lấy role
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Không tìm thấy tài khoản người dùng.' })
        }

        const booking = await bookingsService.cancelBooking(id as string, user_id, user.role || 'tourist', cancelReason)

        return res.status(httpStatus.OK).json({
            message: 'Chuyến đi đã được hủy thành công theo chính sách.',
            result: booking
        })
    } catch (error: any) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: error.message || 'Không thể hủy chuyến đi.'
        })
    }
}

// 5. Lấy danh sách booking của cá nhân
export const getMyBookingsController = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.decoded_authorization as TokenPayload

        // Truy vấn user để lấy role
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Không tìm thấy tài khoản người dùng.' })
        }

        const bookings = await bookingsService.getMyBookings(user_id, user.role || 'tourist')

        return res.status(httpStatus.OK).json({
            message: 'Lấy danh sách đặt tour thành công.',
            result: bookings
        })
    } catch (error: any) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể lấy danh sách đặt tour.'
        })
    }
}

// 6. Lấy chi tiết booking
export const getBookingByIdController = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.decoded_authorization as TokenPayload
        const { id } = req.params

        // Truy vấn user để lấy role
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Không tìm thấy tài khoản người dùng.' })
        }

        const booking = await bookingsService.getBookingById(id as string, user_id, user.role || 'tourist')

        return res.status(httpStatus.OK).json({
            message: 'Lấy chi tiết đặt tour thành công.',
            result: booking
        })
    } catch (error: any) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: error.message || 'Không thể lấy chi tiết đặt tour.'
        })
    }
}

// 7. Lấy chuyến đi thành công của Tourist
export const getTouristBookingsController = async (req: Request, res: Response) => {
    const { touristId } = req.params
    const bookings = await bookingsService.getTouristBookings(touristId as string)
    return res.status(httpStatus.OK).json({
        message: 'Lấy danh sách chuyến đi của Tourist thành công.',
        result: bookings
    })
}

// 8. Lấy chuyến đi thành công của Buddy
export const getBuddyBookingsController = async (req: Request, res: Response) => {
    const { buddyId } = req.params
    const bookings = await bookingsService.getBuddyBookings(buddyId as string)
    return res.status(httpStatus.OK).json({
        message: 'Lấy danh sách chuyến đi của Buddy thành công.',
        result: bookings
    })
}

// 9. Bắt đầu chuyến đi (Check-in sang 'ongoing')
export const startBookingController = async (req: Request, res: Response) => {
    const { id } = req.params
    const booking = await bookingsService.startBooking(id as string)
    return res.status(httpStatus.OK).json({
        message: 'Bắt đầu chuyến đi thành công! Chúc bạn có một hành trình vui vẻ.',
        result: booking
    })
}

// 10. Tourist xác nhận hoàn thành tour (completed & giải ngân)
export const touristCompleteBookingController = async (req: Request, res: Response) => {
    const { id } = req.params
    const booking = await bookingsService.touristCompleteBooking(id as string)
    return res.status(httpStatus.OK).json({
        message: 'Xác nhận hoàn thành chuyến đi thành công! Thu nhập sẽ được giải ngân cho Buddy sau 24 giờ.',
        result: booking
    })
}

// 11. Tourist gửi khiếu nại (Dispute)
export const raiseDisputeController = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.decoded_authorization as TokenPayload
        const { id } = req.params
        const { disputeReason } = req.body

        if (!disputeReason || disputeReason.trim().length < 10) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Vui lòng mô tả lý do khiếu nại chi tiết hơn (ít nhất 10 ký tự).'
            })
        }

        const booking = await bookingsService.raiseDispute(id as string, user_id, disputeReason)

        return res.status(httpStatus.OK).json({
            message: 'Khiếu nại đã được ghi nhận. Admin sẽ xem xét và phản hồi trong vòng 24 giờ.',
            result: booking
        })
    } catch (error: any) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: error.message || 'Không thể gửi khiếu nại.'
        })
    }
}

// 11.5 Buddy gửi giải trình
export const submitBuddyDefenseController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const user_id = req.decoded_authorization?.user_id as string
        const { defenseReason } = req.body

        if (!defenseReason || defenseReason.trim().length < 10) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Lời giải trình phải có ít nhất 10 ký tự.'
            })
        }

        const booking = await bookingsService.submitBuddyDefense(id as string, user_id, defenseReason)
        
        return res.status(httpStatus.OK).json({
            message: 'Đã gửi lời giải trình thành công.',
            result: booking
        })
    } catch (error: any) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: error.message
        })
    }
}

// 12. Admin giải quyết khiếu nại
export const resolveDisputeController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { refundPercentage, resolutionNote } = req.body

        if (typeof refundPercentage !== 'number' || refundPercentage < 0 || refundPercentage > 100) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Tỷ lệ hoàn tiền không hợp lệ (0-100).'
            })
        }

        if (!resolutionNote || resolutionNote.trim().length < 10) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Vui lòng nhập ghi chú phán quyết (tối thiểu 10 ký tự).'
            })
        }

        const booking = await bookingsService.resolveDispute(id as string, refundPercentage, resolutionNote)

        const message = refundPercentage === 100 
            ? 'Đã hoàn tiền 100% cho Tourist.'
            : refundPercentage === 0
            ? 'Đã giải ngân 100% cho Buddy.'
            : `Đã hoàn tiền ${refundPercentage}% cho Tourist và giải ngân ${100 - refundPercentage}% cho Buddy.`

        return res.status(httpStatus.OK).json({
            message: message + ' Phán quyết đã được gửi đến cả 2 bên.',
            result: booking
        })
    } catch (error: any) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: error.message
        })
    }
}

// 13. Admin lấy danh sách khiếu nại
export const getDisputesController = async (req: Request, res: Response) => {
    try {
        const { status } = req.query
        const disputes = await bookingsService.getDisputes(status as string | undefined)
        return res.status(httpStatus.OK).json({
            message: 'Lấy danh sách khiếu nại thành công.',
            result: disputes
        })
    } catch (error: any) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể lấy danh sách khiếu nại.'
        })
    }
}

// 14. Admin kích hoạt giải ngân Escrow thủ công
export const releaseEscrowController = async (req: Request, res: Response) => {
    try {
        const result = await bookingsService.releaseEscrowPayouts()
        return res.status(httpStatus.OK).json({
            message: `Giải ngân Escrow hoàn tất: ${result.releasedCount}/${result.totalPending} booking được xử lý.`,
            result
        })
    } catch (error: any) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Không thể thực hiện giải ngân Escrow.'
        })
    }
}

// 15. Tourist yêu cầu gia hạn chuyến đi (+Giờ)
export const requestExtensionController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const user_id = req.decoded_authorization?.user_id as string
        const { additionalHours, reason } = req.body

        const booking = await bookingsService.requestExtension(id as string, user_id, Number(additionalHours), reason)

        return res.status(httpStatus.OK).json({
            message: `Đã gửi yêu cầu gia hạn (+${additionalHours} giờ) tới Buddy thành công.`,
            result: booking
        })
    } catch (error: any) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: error.message
        })
    }
}

// 16. Buddy đồng ý gia hạn chuyến đi
export const acceptExtensionController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const user_id = req.decoded_authorization?.user_id as string
        const { requestId } = req.body

        const booking = await bookingsService.acceptExtension(id as string, user_id, requestId)

        return res.status(httpStatus.OK).json({
            message: 'Đã xác nhận gia hạn chuyến đi thành công.',
            result: booking
        })
    } catch (error: any) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: error.message
        })
    }
}

// 16.5 Tourist thanh toán phí gia hạn
export const payExtensionController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const user_id = req.decoded_authorization?.user_id as string
        const { requestId } = req.body

        const booking = await bookingsService.payExtension(id as string, user_id, requestId)

        return res.status(httpStatus.OK).json({
            message: 'Đã thanh toán thành công. Thời gian chuyến đi đã được gia hạn!',
            result: booking
        })
    } catch (error: any) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: error.message
        })
    }
}

// 16.6 Tạo VNPay URL thanh toán gia hạn chuyến đi
export const createVNPayExtensionUrlController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const user_id = req.decoded_authorization?.user_id as string
        const { requestId } = req.body

        const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'

        const paymentUrl = await bookingsService.createVNPayExtensionUrl(
            id as string,
            user_id,
            requestId,
            Array.isArray(ipAddr) ? ipAddr[0] : ipAddr
        )

        return res.status(httpStatus.OK).json({
            message: 'Tạo link thanh toán VNPay thành công',
            result: { paymentUrl }
        })
    } catch (error: any) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: error.message
        })
    }
}

// 17. Buddy từ chối gia hạn chuyến đi
export const rejectExtensionController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const user_id = req.decoded_authorization?.user_id as string
        const { requestId, rejectReason } = req.body

        const booking = await bookingsService.rejectExtension(id as string, user_id, requestId, rejectReason)

        return res.status(httpStatus.OK).json({
            message: 'Đã từ chối yêu cầu gia hạn chuyến đi.',
            result: booking
        })
    } catch (error: any) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: error.message
        })
    }
}

