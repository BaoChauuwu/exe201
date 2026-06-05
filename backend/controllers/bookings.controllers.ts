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
