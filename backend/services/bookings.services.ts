import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'
import BookingModel from '../models/Booking.model'
import { IBooking } from '../models/schemas/Booking.schema'
import ExperienceModel from '../models/Experience.model'
import BuddyProfileModel from '../models/BuddyProfile.model'
import AvailabilitySlotModel from '../models/AvailabilitySlot.model'
import TransactionModel from '../models/Transaction.model'
import UserModel from '../models/User.model'
import ReviewModel from '../models/Review.model'

class BookingsService {
    // 1. Tạo Booking mới (Pending & Unpaid)
    async createBooking(data: {
        touristId: string
        experienceId: string
        scheduledDate: string
        startTime: string
        hours: number
        groupSize: number
        refundBankInfo?: {
            bankCode: string
            accountNumber: string
            accountName: string
        }
    }) {
        const { touristId, experienceId, scheduledDate, startTime, hours, groupSize, refundBankInfo } = data

        // Lấy thông tin Experience
        const experience = await ExperienceModel.findById(experienceId)
        if (!experience) {
            throw new Error('Không tìm thấy tour này.')
        }

        // Validate ngày trong tương lai
        const scheduledDateObj = new Date(scheduledDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (scheduledDateObj < today) {
            throw new Error('Ngày đặt tour phải là ngày trong tương lai.')
        }

        // Validate số lượng người
        const maxGroupSize = experience.maxGroupSize || 1
        if (groupSize < 1 || groupSize > maxGroupSize) {
            throw new Error(`Số lượng người đặt tour không hợp lệ (Tối đa ${maxGroupSize} người).`)
        }

        // Validate số giờ đi
        const minHours = experience.minHours || 1
        if (hours < minHours) {
            throw new Error(`Số giờ đặt tour tối thiểu phải là ${minHours} giờ.`)
        }

        // Lấy thông tin Buddy Profile
        const buddyProfile = await BuddyProfileModel.findOne({ userId: experience.buddyId })
        if (!buddyProfile) {
            throw new Error('Không tìm thấy hồ sơ của Local Buddy dẫn tour này.')
        }

        // Validate Trùng Lịch bận của Buddy và Khung giờ làm việc
        await this.checkBuddyAvailability(
            experience.buddyId.toString(),
            scheduledDateObj,
            startTime,
            hours,
            buddyProfile.availability || []
        )

        // Tính toán chi phí snapshot
        const pricePerHourSnapshot = experience.price
        const totalPrice = pricePerHourSnapshot * hours
        const commissionAmount = totalPrice * 0.15 // 15% Platform Commission
        const buddyEarning = totalPrice - commissionAmount

        // Tạo mã booking độc nhất
        const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase()
        const bookingCode = `BK-${randomStr}`

        // Cập nhật thông tin hoàn tiền mặc định cho User nếu được cung cấp
        if (refundBankInfo && refundBankInfo.accountNumber) {
            const touristUser = await UserModel.findById(touristId)
            if (touristUser && (!touristUser.refundPaymentMethod || !touristUser.refundPaymentMethod.accountNumber)) {
                touristUser.refundPaymentMethod = {
                    bankCode: refundBankInfo.bankCode,
                    accountNumber: refundBankInfo.accountNumber,
                    accountName: refundBankInfo.accountName
                }
                await touristUser.save()
            }
        }

        const newBooking = new BookingModel({
            bookingCode,
            touristId: new ObjectId(touristId),
            buddyId: experience.buddyId,
            experienceId: experience._id,
            scheduledDate: scheduledDateObj,
            startTime,
            hours,
            groupSize,
            pricePerHourSnapshot,
            totalPrice,
            commissionAmount,
            buddyEarning,
            paymentStatus: 'unpaid',
            status: 'pending',
            meetingPoint: experience.meetingPoint,
            refundBankInfo: refundBankInfo ? {
                bankCode: refundBankInfo.bankCode,
                accountNumber: refundBankInfo.accountNumber,
                accountName: refundBankInfo.accountName
            } : undefined
        })

        await newBooking.save()
        return newBooking
    }

    // 2. Kiểm tra lịch bận của Buddy
    private async checkBuddyAvailability(
        buddyId: string,
        date: Date,
        startTime: string,
        hours: number,
        buddyAvailability: string[]
    ): Promise<void> {
        // Quy đổi booking mới ra số phút tính từ đầu ngày
        const [newHour, newMin] = startTime.split(':').map(Number)
        const newStartMin = newHour * 60 + newMin
        const newEndMin = newStartMin + hours * 60

        // 2.0. Kiểm tra khung giờ làm việc của Buddy (Availability)
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const dayName = daysOfWeek[date.getDay()]
        
        let isWithinWorkingHours = false
        if (buddyAvailability && buddyAvailability.length > 0) {
            for (const slotStr of buddyAvailability) {
                const parts = slotStr.split(' ')
                // format: "Monday 08:00 - 17:00"
                if (parts.length >= 3 && parts[0] === dayName) {
                    const slotStart = parts[1]
                    const slotEnd = parts[3]
                    
                    const [slotStartHour, slotStartMin] = slotStart.split(':').map(Number)
                    const slotStartMins = slotStartHour * 60 + slotStartMin
                    
                    const [slotEndHour, slotEndMin] = slotEnd.split(':').map(Number)
                    const slotEndMins = slotEndHour * 60 + slotEndMin
                    
                    if (newStartMin >= slotStartMins && newEndMin <= slotEndMins) {
                        isWithinWorkingHours = true
                        break
                    }
                }
            }
        }
        
        if (!isWithinWorkingHours) {
            throw new Error(`Local Buddy không làm việc vào khung giờ này (Yêu cầu thuộc khoảng thời gian rảnh trong ngày ${dayName}).`)
        }

        // 2.1. Kiểm tra các Booking đã Confirm/Ongoing của Buddy trong ngày (và các booking pending trong 15 phút)
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        const fifteenMinsAgo = new Date()
        fifteenMinsAgo.setMinutes(fifteenMinsAgo.getMinutes() - 15)

        const existingBookings = await BookingModel.find({
            buddyId: new ObjectId(buddyId),
            scheduledDate: { $gte: startOfDay, $lte: endOfDay },
            $or: [
                { status: { $in: ['confirmed', 'ongoing'] } },
                { status: 'pending', createdAt: { $gte: fifteenMinsAgo } }
            ]
        })

        for (const booking of existingBookings) {
            const [existHour, existMin] = booking.startTime.split(':').map(Number)
            const existStartMin = existHour * 60 + existMin
            const existEndMin = existStartMin + booking.hours * 60

            // Kiểm tra overlap
            if (newStartMin < existEndMin && newEndMin > existStartMin) {
                throw new Error('Local Buddy đã bận dẫn tour vào khung giờ này.')
            }
        }

        // 2.2. Kiểm tra trong AvailabilitySlots xem có bị khóa ('blocked') hoặc đã được đặt ('booked') trùng khung giờ đó không
        const blockedSlots = await AvailabilitySlotModel.find({
            buddyId: new ObjectId(buddyId),
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['blocked', 'booked'] }
        })

        for (const slot of blockedSlots) {
            const [slotStartHour, slotStartMin] = slot.startTime.split(':').map(Number)
            const [slotEndHour, slotEndMin] = slot.endTime.split(':').map(Number)
            const existStartMin = slotStartHour * 60 + slotStartMin
            const existEndMin = slotEndHour * 60 + slotEndMin

            if (newStartMin < existEndMin && newEndMin > existStartMin) {
                throw new Error('Local Buddy đã bị khóa lịch vào khung giờ này.')
            }
        }
    }

    // 3. Xử lý thanh toán giả lập bằng VNPAY/MOMO (Confirm & Paid)
    async processPayment(bookingId: string, touristId: string, paymentMethod: string) {
        const session = await mongoose.startSession().catch(() => null)
        if (session) session.startTransaction()

        try {
            const booking = await BookingModel.findById(bookingId)
            if (!booking) {
                throw new Error('Không tìm thấy thông tin đặt tour này.')
            }

            if (booking.touristId.toString() !== touristId) {
                throw new Error('Bạn không có quyền thực hiện thanh toán cho booking này.')
            }

            if (booking.paymentStatus === 'paid') {
                throw new Error('Booking này đã được thanh toán.')
            }

            // 3.0. Re-check availability exactly at payment time to prevent double-booking
            const startOfDay = new Date(booking.scheduledDate)
            startOfDay.setHours(0, 0, 0, 0)
            const endOfDay = new Date(booking.scheduledDate)
            endOfDay.setHours(23, 59, 59, 999)

            const existingBookings = await BookingModel.find({
                buddyId: booking.buddyId,
                scheduledDate: { $gte: startOfDay, $lte: endOfDay },
                status: { $in: ['confirmed', 'ongoing'] },
                _id: { $ne: booking._id }
            }).session(session || null)

            const [checkStartHour, checkStartMin] = booking.startTime.split(':').map(Number)
            const newStartMin = checkStartHour * 60 + checkStartMin
            const newEndMin = newStartMin + booking.hours * 60

            for (const b of existingBookings) {
                const [existHour, existMin] = b.startTime.split(':').map(Number)
                const existStartMin = existHour * 60 + existMin
                const existEndMin = existStartMin + b.hours * 60
                if (newStartMin < existEndMin && newEndMin > existStartMin) {
                    throw new Error('Rất tiếc, khung giờ này vừa được người khác thanh toán. Vui lòng chọn giờ khác.')
                }
            }

            // 3.1. Cập nhật booking sang Paid & Confirmed
            booking.paymentStatus = 'paid'
            booking.status = 'confirmed'
            booking.paymentMethod = paymentMethod
            await booking.save()

            // 3.2. Ghi nhận tiền vào pendingBalance của Buddy
            const buddyProfile = await BuddyProfileModel.findOne({ userId: booking.buddyId })
            if (buddyProfile) {
                buddyProfile.pendingBalance = (buddyProfile.pendingBalance || 0) + booking.buddyEarning
                await buddyProfile.save()
            }

            // 3.3. Tạo bản ghi giao dịch (Transaction)
            const transaction = new TransactionModel({
                bookingId: booking._id,
                payerId: booking.touristId,
                type: 'payment',
                amount: booking.totalPrice,
                paymentMethod: paymentMethod || 'VNPay',
                gatewayTransactionId: 'MOCK-TXN-' + Math.random().toString(36).substring(2, 12).toUpperCase(),
                status: 'success'
            })
            await transaction.save()

            // 3.4. Tạo AvailabilitySlot khóa lịch biểu của Buddy
            const [startHour, startMin] = booking.startTime.split(':').map(Number)
            const endTotalMin = (startHour * 60 + startMin) + booking.hours * 60
            const endHour = Math.floor(endTotalMin / 60)
            const endMin = endTotalMin % 60
            const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`

            const availabilitySlot = new AvailabilitySlotModel({
                buddyId: booking.buddyId,
                date: booking.scheduledDate,
                startTime: booking.startTime,
                endTime: endTime,
                status: 'booked',
                bookingId: booking._id
            })
            await availabilitySlot.save()

            if (session) {
                await session.commitTransaction()
                session.endSession()
            }

            return booking
        } catch (error) {
            if (session) {
                await session.abortTransaction()
                session.endSession()
            }
            throw error
        }
    }

    // 4. Thanh toán bằng Ví điện tử nội bộ UniTravel của Tourist (Pay with Wallet)
    async payWithWallet(bookingId: string, touristId: string) {
        const session = await mongoose.startSession().catch(() => null)
        if (session) session.startTransaction()

        try {
            const booking = await BookingModel.findById(bookingId)
            if (!booking) {
                throw new Error('Không tìm thấy thông tin đặt tour này.')
            }

            if (booking.touristId.toString() !== touristId) {
                throw new Error('Bạn không có quyền thanh toán cho booking này.')
            }

            if (booking.paymentStatus === 'paid') {
                throw new Error('Booking này đã được thanh toán.')
            }

            // Lấy thông tin Tourist User để khấu trừ ví
            const tourist = await UserModel.findById(touristId)
            if (!tourist) {
                throw new Error('Không tìm thấy tài khoản người dùng.')
            }

            const currentBalance = tourist.walletBalance || 0
            if (currentBalance < booking.totalPrice) {
                throw new Error(`Số dư ví của bạn không đủ để thanh toán (Yêu cầu: ${booking.totalPrice.toLocaleString()} ₫, Số dư: ${currentBalance.toLocaleString()} ₫).`)
            }

            // 4.0. Re-check availability exactly at payment time to prevent double-booking
            const startOfDay = new Date(booking.scheduledDate)
            startOfDay.setHours(0, 0, 0, 0)
            const endOfDay = new Date(booking.scheduledDate)
            endOfDay.setHours(23, 59, 59, 999)

            const existingBookings = await BookingModel.find({
                buddyId: booking.buddyId,
                scheduledDate: { $gte: startOfDay, $lte: endOfDay },
                status: { $in: ['confirmed', 'ongoing'] },
                _id: { $ne: booking._id }
            }).session(session || null)

            const [checkStartHour, checkStartMin] = booking.startTime.split(':').map(Number)
            const newStartMin = checkStartHour * 60 + checkStartMin
            const newEndMin = newStartMin + booking.hours * 60

            for (const b of existingBookings) {
                const [existHour, existMin] = b.startTime.split(':').map(Number)
                const existStartMin = existHour * 60 + existMin
                const existEndMin = existStartMin + b.hours * 60
                if (newStartMin < existEndMin && newEndMin > existStartMin) {
                    throw new Error('Rất tiếc, khung giờ này vừa được người khác thanh toán. Vui lòng chọn giờ khác.')
                }
            }

            // 4.1. Khấu trừ số dư ví của Tourist
            tourist.walletBalance = currentBalance - booking.totalPrice
            await tourist.save()

            // 4.2. Cập nhật booking sang Paid & Confirmed
            booking.paymentStatus = 'paid'
            booking.status = 'confirmed'
            booking.paymentMethod = 'Ví UniTravel'
            await booking.save()

            // 4.3. Ghi nhận tiền vào pendingBalance của Buddy
            const buddyProfile = await BuddyProfileModel.findOne({ userId: booking.buddyId })
            if (buddyProfile) {
                buddyProfile.pendingBalance = (buddyProfile.pendingBalance || 0) + booking.buddyEarning
                await buddyProfile.save()
            }

            // 4.4. Tạo bản ghi giao dịch (Transaction)
            const transaction = new TransactionModel({
                bookingId: booking._id,
                payerId: booking.touristId,
                type: 'payment',
                amount: booking.totalPrice,
                paymentMethod: 'Ví UniTravel',
                gatewayTransactionId: 'WALLET-TXN-' + Math.random().toString(36).substring(2, 12).toUpperCase(),
                status: 'success'
            })
            await transaction.save()

            // 4.5. Tạo AvailabilitySlot khóa lịch biểu của Buddy
            const [startHour, startMin] = booking.startTime.split(':').map(Number)
            const endTotalMin = (startHour * 60 + startMin) + booking.hours * 60
            const endHour = Math.floor(endTotalMin / 60)
            const endMin = endTotalMin % 60
            const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`

            const availabilitySlot = new AvailabilitySlotModel({
                buddyId: booking.buddyId,
                date: booking.scheduledDate,
                startTime: booking.startTime,
                endTime: endTime,
                status: 'booked',
                bookingId: booking._id
            })
            await availabilitySlot.save()

            if (session) {
                await session.commitTransaction()
                session.endSession()
            }

            return booking
        } catch (error) {
            if (session) {
                await session.abortTransaction()
                session.endSession()
            }
            throw error
        }
    }

    // 5. Xác nhận hoàn thành tour (Vá lỗ hổng: Cấm hoàn thành tour sớm trước giờ kết thúc)
    async completeBooking(bookingId: string, userId: string, userRole: string) {
        const session = await mongoose.startSession().catch(() => null)
        if (session) session.startTransaction()

        try {
            const booking = await BookingModel.findById(bookingId)
            if (!booking) {
                throw new Error('Không tìm thấy thông tin đặt tour này.')
            }

            // Quyền xác nhận hoàn thành: Admin hoặc Buddy của tour đó
            if (userRole !== 'admin' && booking.buddyId.toString() !== userId) {
                throw new Error('Bạn không có quyền xác nhận hoàn thành chuyến đi này.')
            }

            if (booking.status !== 'confirmed' && booking.status !== 'ongoing') {
                throw new Error('Chuyến đi không ở trạng thái hợp lệ để có thể bấm hoàn thành.')
            }

            // VÁ LỖ HỔNG: Kiểm tra thời gian kết thúc chuyến đi (TourEndTime)
            const tourEndTime = new Date(booking.scheduledDate)
            const [startHour, startMin] = booking.startTime.split(':').map(Number)
            tourEndTime.setHours(startHour, startMin, 0, 0)
            // Cộng thêm số giờ bận dẫn tour
            tourEndTime.setHours(tourEndTime.getHours() + booking.hours)

            const now = new Date()
            if (now < tourEndTime) {
                const endStr = `${String(tourEndTime.getHours()).padStart(2, '0')}:${String(tourEndTime.getMinutes()).padStart(2, '0')} ngày ${tourEndTime.toLocaleDateString('vi-VN')}`
                throw new Error(`Lỗ hổng bảo vệ: Bạn không thể hoàn thành chuyến đi sớm hơn thời gian kết thúc thực tế (dự kiến kết thúc lúc ${endStr}).`)
            }

            // 5.1. Cập nhật booking
            booking.status = 'completed'
            booking.actualEndTime = new Date()
            booking.insuranceStatus = 'expired'
            // Đặt thời điểm giải ngân Escrow: 24 giờ sau khi kết thúc tour
            booking.payoutReleasedAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
            await booking.save()

            // 5.2. Cập nhật độ uy tín của Buddy (không giải ngân người dùng tiền ngay)
            const buddyProfile = await BuddyProfileModel.findOne({ userId: booking.buddyId })
            if (buddyProfile) {
                const totalBookings = (buddyProfile.totalBookingsCount || 0) + 1
                const completedBookings = (buddyProfile.completedBookingsCount || 0) + 1
                buddyProfile.totalBookingsCount = totalBookings
                buddyProfile.completedBookingsCount = completedBookings
                buddyProfile.totalCompletedTours = completedBookings
                // Tính lại tỷ lệ hoàn thành
                buddyProfile.reliabilityRate = Math.round((completedBookings / totalBookings) * 100)
                await buddyProfile.save()
            }

            // NOTE: Tiền trong pendingBalance của Buddy sẽ được giải ngân tự động sau 24 giờ
            // thông qua cron job hoặc khi Tourist không khiếu nại trong 24h
            // Xem: releaseEscrowPayouts() có thể chạy theo lịch hoặc gọi thủ công từ Admin

            if (session) {
                await session.commitTransaction()
                session.endSession()
            }

            return booking
        } catch (error) {
            if (session) {
                await session.abortTransaction()
                session.endSession()
            }
            throw error
        }
    }

    // 6. Hủy đặt lịch (Vá lỗ hổng & Tích hợp Chính sách Hủy tour của Buddy nghiêm ngặt)
    async cancelBooking(bookingId: string, userId: string, userRole: string, cancelReason: string) {
        const session = await mongoose.startSession().catch(() => null)
        if (session) session.startTransaction()

        try {
            const booking = await BookingModel.findById(bookingId)
            if (!booking) {
                throw new Error('Không tìm thấy thông tin đặt tour này.')
            }

            // Quyền hủy: tourist của booking, buddy của booking hoặc admin
            const isTourist = booking.touristId.toString() === userId
            const isBuddy = booking.buddyId.toString() === userId
            const isAdmin = userRole === 'admin'

            if (!isTourist && !isBuddy && !isAdmin) {
                throw new Error('Bạn không có quyền hủy chuyến đi này.')
            }

            if (booking.status === 'completed' || booking.status === 'cancelled') {
                throw new Error('Không thể hủy chuyến đi đã hoàn thành hoặc đã hủy.')
            }

            // Tính thời gian khởi hành
            const tourStartDateTime = new Date(booking.scheduledDate)
            const [startHour, startMin] = booking.startTime.split(':').map(Number)
            tourStartDateTime.setHours(startHour, startMin, 0, 0)

            const now = new Date()
            const diffInHours = (tourStartDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

            const isPaid = booking.paymentStatus === 'paid'

            // 6.1. Cập nhật trạng thái Booking sang Cancelled
            booking.status = 'cancelled'
            booking.cancelReason = cancelReason || `Hủy bởi ${isTourist ? 'Tourist' : isBuddy ? 'Buddy' : 'Admin'}`
            if (session) {
                await booking.save({ session })
            } else {
                await booking.save()
            }

            // 6.2. Giải phóng / Khóa slot lịch biểu của Buddy
            if (isTourist || isAdmin) {
                if (session) {
                    await AvailabilitySlotModel.deleteOne({ bookingId: booking._id }).session(session)
                } else {
                    await AvailabilitySlotModel.deleteOne({ bookingId: booking._id })
                }
            } else if (isBuddy) {
                // Hủy bởi Buddy: Khóa slot bằng trạng thái 'blocked' (Không mở lại slot)
                const slot = session 
                    ? await AvailabilitySlotModel.findOne({ bookingId: booking._id }).session(session)
                    : await AvailabilitySlotModel.findOne({ bookingId: booking._id })
                
                if (slot) {
                    slot.status = 'blocked'
                    if (session) {
                        await slot.save({ session })
                    } else {
                        await slot.save()
                    }
                }
            }

            // 6.3. Xử lý tài chính và đền bù/phạt cọc
            if (isPaid) {
                const buddyProfile = session 
                    ? await BuddyProfileModel.findOne({ userId: booking.buddyId }).session(session)
                    : await BuddyProfileModel.findOne({ userId: booking.buddyId })
                
                const touristUser = session 
                    ? await UserModel.findById(booking.touristId).session(session)
                    : await UserModel.findById(booking.touristId)

                if (isTourist) {
                    // LUỒNG TOURIST HỦY (Chính sách 24h)
                    if (diffInHours >= 24) {
                        // Hủy sớm -> Hoàn Tourist 100%, khấu trừ Pending của Buddy
                        if (buddyProfile) {
                            buddyProfile.pendingBalance = Math.max(0, (buddyProfile.pendingBalance || 0) - booking.buddyEarning)
                            if (session) {
                                await buddyProfile.save({ session })
                            } else {
                                await buddyProfile.save()
                            }
                        }

                        if (touristUser) {
                            touristUser.walletBalance = (touristUser.walletBalance || 0) + booking.totalPrice
                            if (session) {
                                await touristUser.save({ session })
                            } else {
                                await touristUser.save()
                            }
                        }

                        // Giao dịch hoàn tiền
                        const refundTransaction = new TransactionModel({
                            bookingId: booking._id,
                            payerId: booking.touristId,
                            type: 'refund',
                            amount: booking.totalPrice,
                            paymentMethod: booking.paymentMethod || 'Ví UniTravel',
                            gatewayTransactionId: 'MOCK-REFUND-' + Math.random().toString(36).substring(2, 12).toUpperCase(),
                            status: 'success'
                        })
                        if (session) {
                            await refundTransaction.save({ session })
                        } else {
                            await refundTransaction.save()
                        }
                    } else {
                        // Hủy muộn -> Phạt cọc Tourist, chuyển Pending sang ví khả dụng của Buddy làm đền bù bận lịch
                        if (buddyProfile) {
                            buddyProfile.pendingBalance = Math.max(0, (buddyProfile.pendingBalance || 0) - booking.buddyEarning)
                            buddyProfile.walletBalance = (buddyProfile.walletBalance || 0) + booking.buddyEarning
                            if (session) {
                                await buddyProfile.save({ session })
                            } else {
                                await buddyProfile.save()
                            }
                        }
                    }
                } else if (isBuddy) {
                    // LUỒNG BUDDY HỦY (Hoàn tiền 100% cho Tourist + Phạt tài chính & uy tín Buddy)
                    
                    // A. Hoàn tiền 100% cho Tourist ngay lập tức
                    if (touristUser) {
                        touristUser.walletBalance = (touristUser.walletBalance || 0) + booking.totalPrice
                        if (session) {
                            await touristUser.save({ session })
                        } else {
                            await touristUser.save()
                        }
                    }

                    // B. Khấu trừ pending balance đã cộng tạm tính của Buddy về 0
                    if (buddyProfile) {
                        buddyProfile.pendingBalance = Math.max(0, (buddyProfile.pendingBalance || 0) - booking.buddyEarning)
                        
                        // C. Phạt tài chính Buddy trừ thẳng vào ví khả dụng (walletBalance) của Buddy
                        const penaltyAmount = diffInHours >= 24 
                            ? booking.totalPrice * 0.1  // Hủy trước 24h: Phạt 10% vận hành
                            : booking.totalPrice * 0.3; // Hủy sát giờ < 24h: Phạt 30% tổng tiền
                        
                        buddyProfile.walletBalance = (buddyProfile.walletBalance || 0) - penaltyAmount
                        if (session) {
                            await buddyProfile.save({ session })
                        } else {
                            await buddyProfile.save()
                        }
                    }

                    // D. Giao dịch hoàn tiền cho Tourist
                    const refundTransaction = new TransactionModel({
                        bookingId: booking._id,
                        payerId: booking.touristId,
                        type: 'refund',
                        amount: booking.totalPrice,
                        paymentMethod: booking.paymentMethod || 'Ví UniTravel',
                        gatewayTransactionId: 'MOCK-REFUND-BUDDY-' + Math.random().toString(36).substring(2, 12).toUpperCase(),
                        status: 'success'
                    })
                    if (session) {
                        await refundTransaction.save({ session })
                    } else {
                        await refundTransaction.save()
                    }

                    // E. Tạo review 1-sao tự động trên hồ sơ cá nhân của Buddy để lưu vết uy tín
                    const sysComment = `[HỆ THỐNG]: Người hướng dẫn đã tự ý hủy chuyến đi này ${diffInHours.toFixed(1)} giờ trước khi khởi hành. Lý do: ${cancelReason || 'Không cung cấp'}`
                    if (session) {
                        await ReviewModel.create([{
                            bookingId: booking._id,
                            experienceId: booking.experienceId,
                            reviewerId: booking.touristId,
                            targetId: booking.buddyId,
                            type: 'tourist_to_buddy',
                            rating: 1,
                            comment: sysComment,
                            isPublic: true
                        }], { session })
                    } else {
                        await ReviewModel.create([{
                            bookingId: booking._id,
                            experienceId: booking.experienceId,
                            reviewerId: booking.touristId,
                            targetId: booking.buddyId,
                            type: 'tourist_to_buddy',
                            rating: 1,
                            comment: sysComment,
                            isPublic: true
                        }])
                    }

                    // F. Cập nhật tỷ lệ hoàn thành (Reliability Rate) của Buddy sau khi hủy
                    if (buddyProfile) {
                        const totalBookings = (buddyProfile.totalBookingsCount || 0) + 1
                        // completedBookingsCount không tăng vì tour bị hủy
                        const completedBookings = buddyProfile.completedBookingsCount || 0
                        buddyProfile.totalBookingsCount = totalBookings
                        buddyProfile.reliabilityRate = Math.round((completedBookings / totalBookings) * 100)
                        if (session) {
                            await buddyProfile.save({ session })
                        } else {
                            await buddyProfile.save()
                        }
                    }
                } else if (isAdmin) {

                    // LUỒNG ADMIN HỦY (Hoàn tiền 100% cho Tourist, trừ Pending của Buddy)
                    if (buddyProfile) {
                        buddyProfile.pendingBalance = Math.max(0, (buddyProfile.pendingBalance || 0) - booking.buddyEarning)
                        if (session) {
                            await buddyProfile.save({ session })
                        } else {
                            await buddyProfile.save()
                        }
                    }

                    if (touristUser) {
                        touristUser.walletBalance = (touristUser.walletBalance || 0) + booking.totalPrice
                        if (session) {
                            await touristUser.save({ session })
                        } else {
                            await touristUser.save()
                        }
                    }

                    const refundTransaction = new TransactionModel({
                        bookingId: booking._id,
                        payerId: booking.touristId,
                        type: 'refund',
                        amount: booking.totalPrice,
                        paymentMethod: booking.paymentMethod || 'Ví UniTravel',
                        gatewayTransactionId: 'MOCK-REFUND-ADMIN-' + Math.random().toString(36).substring(2, 12).toUpperCase(),
                        status: 'success'
                    })
                    if (session) {
                        await refundTransaction.save({ session })
                    } else {
                        await refundTransaction.save()
                    }
                }
            }

            if (session) {
                await session.commitTransaction()
                session.endSession()
            }

            return booking
        } catch (error) {
            if (session) {
                await session.abortTransaction()
                session.endSession()
            }
            throw error
        }
    }

    // 7. Lấy danh sách booking của user
    async getMyBookings(userId: string, userRole: string) {
        const query = userRole === 'buddy' 
            ? { buddyId: new ObjectId(userId) } 
            : { touristId: new ObjectId(userId) }

        const bookings = await BookingModel.find(query)
            .populate('experienceId')
            .populate({
                path: 'buddyId',
                select: 'name avatar email phone'
            })
            .populate({
                path: 'touristId',
                select: 'name avatar email phone refundPaymentMethod walletBalance'
            })
            .sort({ created_at: -1 })

        return bookings
    }

    // 8. Lấy chi tiết booking
    async getBookingById(bookingId: string, userId: string, userRole: string) {
        const booking = await BookingModel.findById(bookingId)
            .populate('experienceId')
            .populate({
                path: 'buddyId',
                select: 'name avatar email phone'
            })
            .populate({
                path: 'touristId',
                select: 'name avatar email phone refundPaymentMethod walletBalance'
            })

        if (!booking) {
            throw new Error('Không tìm thấy thông tin đặt tour này.')
        }

        const isAuthorized = userRole === 'admin' 
            || booking.touristId._id.toString() === userId 
            || booking.buddyId._id.toString() === userId

        if (!isAuthorized) {
            throw new Error('Bạn không có quyền truy cập thông tin đặt tour này.')
        }

        return booking
    }

    // 9. Lấy danh sách booking đã thanh toán thành công của Tourist
    async getTouristBookings(touristId: string) {
        const bookings = await BookingModel.find({
            touristId: new ObjectId(touristId),
            $or: [{ paymentStatus: 'paid' }, { status: 'Success' }]
        })
            .populate('experienceId')
            .populate({
                path: 'buddyId',
                select: 'name avatar email phone'
            })
            .sort({ created_at: -1 })

        return bookings
    }

    // 10. Lấy danh sách booking đã thanh toán thành công của Buddy
    async getBuddyBookings(buddyId: string) {
        const bookings = await BookingModel.find({
            buddyId: new ObjectId(buddyId),
            $or: [{ paymentStatus: 'paid' }, { status: 'Success' }]
        })
            .populate('experienceId')
            .populate({
                path: 'touristId',
                select: 'name avatar email phone'
            })
            .sort({ created_at: -1 })

        return bookings
    }

    // 11. Bắt đầu chuyến đi (Check-in sang 'ongoing' + Kích hoạt Bảo hiểm + Tạo Token chia sẻ)
    async startBooking(bookingId: string) {
        const booking = await BookingModel.findById(bookingId)
        if (!booking) {
            throw new Error('Không tìm thấy thông tin đặt tour này.')
        }

        booking.status = 'ongoing'
        booking.actualStartTime = new Date()

        // Kích hoạt Bảo hiểm UniTravel Care
        const policyCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        booking.insurancePolicyNumber = `UT-CARE-${policyCode}`
        booking.insuranceStatus = 'active'

        // Tạo token chia sẻ hành trình bí mật (dùng như UUID)
        const tokenPart1 = Math.random().toString(36).substring(2, 10)
        const tokenPart2 = Math.random().toString(36).substring(2, 10)
        const tokenPart3 = Math.random().toString(36).substring(2, 10)
        booking.shareTrackingToken = `${tokenPart1}-${tokenPart2}-${tokenPart3}`

        await booking.save()

        // Phát socket thông báo cho hai bên cùng biết thời gian thực
        try {
            const { getIO } = require('../socket')
            const io = getIO()
            io.emit(`booking_status_updated_${bookingId}`, {
                status: 'ongoing',
                actualStartTime: booking.actualStartTime,
                insurancePolicyNumber: booking.insurancePolicyNumber,
                shareTrackingToken: booking.shareTrackingToken
            })
        } catch (socketErr) {
            console.error('[BookingsService] Socket.io emit error:', socketErr)
        }

        return booking
    }

    // 12. Tourist xác nhận hoàn thành tour (Check-out sang 'completed' & giải ngân)
    async touristCompleteBooking(bookingId: string) {
        const session = await mongoose.startSession().catch(() => null)
        if (session) session.startTransaction()

        try {
            const booking = session 
                ? await BookingModel.findById(bookingId).session(session)
                : await BookingModel.findById(bookingId)

            if (!booking) {
                throw new Error('Không tìm thấy thông tin đặt tour này.')
            }

            booking.status = 'completed'
            booking.actualEndTime = new Date()
            booking.insuranceStatus = 'expired'
            // Đặt thời điểm giải ngân Escrow 24h
            booking.payoutReleasedAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
            
            if (session) {
                await booking.save({ session })
            } else {
                await booking.save()
            }

            // Cập nhật độ uy tín Buddy (không giải ngân người dùng tiền người dùng người dùng ngay)
            const buddyProfile = session 
                ? await BuddyProfileModel.findOne({ userId: booking.buddyId }).session(session)
                : await BuddyProfileModel.findOne({ userId: booking.buddyId })
            
            if (buddyProfile) {
                const totalBookings = (buddyProfile.totalBookingsCount || 0) + 1
                const completedBookings = (buddyProfile.completedBookingsCount || 0) + 1
                buddyProfile.totalBookingsCount = totalBookings
                buddyProfile.completedBookingsCount = completedBookings
                buddyProfile.totalCompletedTours = completedBookings
                buddyProfile.reliabilityRate = Math.round((completedBookings / totalBookings) * 100)
                
                if (session) {
                    await buddyProfile.save({ session })
                } else {
                    await buddyProfile.save()
                }
            }

            // NOTE: Tiền pending chỉ giải ngân sau 24h nếu không có khiếu nại

            if (session) {
                await session.commitTransaction()
                session.endSession()
            }

            // Phát socket thông báo cho hai bên
            try {
                const { getIO } = require('../socket')
                const io = getIO()
                io.emit(`booking_status_updated_${bookingId}`, { status: 'completed', actualEndTime: booking.actualEndTime })
            } catch (socketErr) {
                console.error('[BookingsService] Socket.io emit error:', socketErr)
            }

            return booking
        } catch (error) {
            if (session) {
                await session.abortTransaction()
                session.endSession()
            }
            throw error
        }
    }

    // 13. Tourist gửi khiếu nại (Dispute) - Đóng băng Escrow
    async raiseDispute(bookingId: string, touristId: string, disputeReason: string) {
        const booking = await BookingModel.findById(bookingId)
        if (!booking) {
            throw new Error('Không tìm thấy thông tin đặt tour này.')
        }

        if (booking.touristId.toString() !== touristId) {
            throw new Error('Bạn không có quyền khiếu nại chuyến đi này.')
        }

        if (!['confirmed', 'ongoing', 'completed'].includes(booking.status)) {
            throw new Error('Chỉ có thể khiếu nại khi chuyến đi đã được xác nhận, đang diễn ra hoặc vừa kết thúc.')
        }

        if (booking.isDisputed) {
            throw new Error('Chuyến đi này đã được gửi khiếu nại trước đó.')
        }

        // Kiểm tra thời hạn khiếu nại: chỉ cho phép trong vòng 24h sau khi tour kết thúc
        if (booking.payoutReleasedAt) {
            const now = new Date()
            if (now > booking.payoutReleasedAt) {
                throw new Error('Đã quá thời hạn 24 giờ để gửi khiếu nại sau khi tour kết thúc.')
            }
        }

        // Đánh dấu booking bị khiếu nại - Đóng băng escrow
        booking.isDisputed = true
        booking.disputeReason = disputeReason
        booking.disputeCreatedAt = new Date()
        booking.disputeStatus = 'pending'
        // Hủy lịch giải ngân tự động
        booking.payoutReleasedAt = undefined
        await booking.save()

        return booking
    }

    // 13.5. Buddy gửi giải trình khiếu nại (Defense)
    async submitBuddyDefense(bookingId: string, buddyId: string, defenseReason: string) {
        const booking = await BookingModel.findById(bookingId)
        if (!booking) {
            throw new Error('Không tìm thấy thông tin đặt tour này.')
        }

        if (booking.buddyId.toString() !== buddyId) {
            throw new Error('Bạn không có quyền thực hiện thao tác này.')
        }

        if (!booking.isDisputed || booking.disputeStatus !== 'pending') {
            throw new Error('Chuyến đi này không trong trạng thái chờ xử lý khiếu nại.')
        }

        if (booking.buddyDefenseReason) {
            throw new Error('Bạn đã gửi giải trình cho khiếu nại này rồi.')
        }

        if (!defenseReason || defenseReason.trim().length < 10) {
            throw new Error('Lời giải trình phải có ít nhất 10 ký tự.')
        }

        booking.buddyDefenseReason = defenseReason
        booking.buddyDefenseSubmittedAt = new Date()
        await booking.save()

        return booking
    }

    // 14. Admin giải quyết khiếu nại
    async resolveDispute(bookingId: string, refundPercentage: number, resolutionNote: string) {
        const session = await mongoose.startSession().catch(() => null)
        if (session) session.startTransaction()

        try {
            const booking = session
                ? await BookingModel.findById(bookingId).session(session)
                : await BookingModel.findById(bookingId)

            if (!booking) {
                throw new Error('Không tìm thấy thông tin đặt tour này.')
            }

            if (!booking.isDisputed || booking.disputeStatus !== 'pending') {
                throw new Error('Chuyến đi này không đang chờ xử lý khiếu nại.')
            }

            if (refundPercentage < 0 || refundPercentage > 100) {
                throw new Error('Tỷ lệ hoàn tiền không hợp lệ (0 - 100).')
            }

            const buddyProfile = session
                ? await BuddyProfileModel.findOne({ userId: booking.buddyId }).session(session)
                : await BuddyProfileModel.findOne({ userId: booking.buddyId })

            const touristUser = session
                ? await UserModel.findById(booking.touristId).session(session)
                : await UserModel.findById(booking.touristId)

            const refundAmount = booking.totalPrice * (refundPercentage / 100)
            const buddyPayoutAmount = booking.buddyEarning * (1 - refundPercentage / 100)

            booking.disputeStatus = refundPercentage === 100 ? 'resolved_refunded' 
                                  : refundPercentage === 0 ? 'resolved_paid' 
                                  : 'resolved_partial'
            booking.disputeRefundPercentage = refundPercentage
            booking.disputeResolutionNote = resolutionNote

            if (buddyProfile) {
                // Trừ toàn bộ tiền chờ (vì tour đã giải quyết xong)
                buddyProfile.pendingBalance = Math.max(0, (buddyProfile.pendingBalance || 0) - booking.buddyEarning)
                // Chỉ cộng vào số dư số tiền được chia
                if (buddyPayoutAmount > 0) {
                    buddyProfile.walletBalance = (buddyProfile.walletBalance || 0) + buddyPayoutAmount
                }
                if (session) await buddyProfile.save({ session })
                else await buddyProfile.save()
            }

            if (touristUser && refundAmount > 0) {
                touristUser.walletBalance = (touristUser.walletBalance || 0) + refundAmount
                if (session) await touristUser.save({ session })
                else await touristUser.save()
            }

            // Giao dịch hoàn tiền
            if (refundAmount > 0) {
                const refundTx = new TransactionModel({
                    bookingId: booking._id,
                    payerId: booking.touristId,
                    type: 'refund',
                    amount: refundAmount,
                    paymentMethod: booking.paymentMethod || 'Ví UniTravel',
                    gatewayTransactionId: 'DISPUTE-REFUND-' + Math.random().toString(36).substring(2, 12).toUpperCase(),
                    status: 'success'
                })
                if (session) await refundTx.save({ session })
                else await refundTx.save()
            }

            // Giao dịch giải ngân
            if (buddyPayoutAmount > 0) {
                const payoutTx = new TransactionModel({
                    bookingId: booking._id,
                    payerId: booking.buddyId,
                    type: 'payout',
                    amount: buddyPayoutAmount,
                    paymentMethod: 'Ví UniTravel',
                    gatewayTransactionId: 'DISPUTE-PAYOUT-' + Math.random().toString(36).substring(2, 12).toUpperCase(),
                    status: 'success'
                })
                if (session) await payoutTx.save({ session })
                else await payoutTx.save()
            }

            if (session) await booking.save({ session })
            else await booking.save()

            if (session) {
                await session.commitTransaction()
                session.endSession()
            }

            return booking
        } catch (error) {
            if (session) {
                await session.abortTransaction()
                session.endSession()
            }
            throw error
        }
    }

    // 15. Lấy danh sách khiếu nại (Admin)
    async getDisputes(status?: string) {
        const query: any = { isDisputed: true }
        if (status) query.disputeStatus = status

        const bookings = await BookingModel.find(query)
            .populate('experienceId')
            .populate({ path: 'buddyId', select: 'name avatar email phone' })
            .populate({ path: 'touristId', select: 'name avatar email phone' })
            .sort({ disputeCreatedAt: -1 })

        return bookings
    }

    // 16. Giải ngân Escrow tự động sau 24h (Admin chạy thủ công hoặc cron job)
    async releaseEscrowPayouts() {
        const now = new Date()
        const dueBookings = await BookingModel.find({
            status: 'completed',
            isDisputed: false,
            payoutReleasedAt: { $lte: now },
            // Chỉ xử lý bookings có pending payout (chưa giải ngân)
            $expr: { $gt: ['$buddyEarning', 0] }
        })

        let releasedCount = 0
        for (const booking of dueBookings) {
            try {
                const buddyProfile = await BuddyProfileModel.findOne({ userId: booking.buddyId })
                if (buddyProfile && (buddyProfile.pendingBalance || 0) >= booking.buddyEarning) {
                    buddyProfile.pendingBalance = Math.max(0, (buddyProfile.pendingBalance || 0) - booking.buddyEarning)
                    buddyProfile.walletBalance = (buddyProfile.walletBalance || 0) + booking.buddyEarning
                    await buddyProfile.save()

                    // Đánh dấu booking đã giải ngân (payoutReleasedAt = quá khứ là dấu hiệu đã xử lý)
                    // Để tránh xử lý trùng, xóa payoutReleasedAt
                    booking.payoutReleasedAt = undefined
                    await booking.save()

                    releasedCount++
                }
            } catch (err) {
                console.error(`[Escrow] Failed to release payout for booking ${booking._id}:`, err)
            }
        }

        return { releasedCount, totalPending: dueBookings.length }
    }
}

const bookingsService = new BookingsService()
export default bookingsService
