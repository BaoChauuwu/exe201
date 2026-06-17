import { Request, Response } from 'express'
import { getIO } from '../socket'
import { ObjectId } from 'mongodb'
import LiveTracking from '../models/LiveTracking.model'

export const updateLocation = async (req: Request, res: Response) => {
    const { bookingId, buddyId, userId, lng, lat, role } = req.body

    try {
        const senderId = buddyId || userId
        let tracking = null
        if (!role || role === 'buddy') {
            if (!senderId) {
                return res.status(400).json({ message: 'Missing buddyId or userId' })
            }
            tracking = await LiveTracking.create({
                bookingId: new ObjectId(bookingId as string),
                buddyId: new ObjectId(senderId as string),
                location: {
                    type: 'Point',
                    coordinates: [lng, lat]
                }
            })
        }

        const io = getIO()
        io.emit(`location_updated_${bookingId}`, { lat, lng, role: role || 'buddy', senderId })

        res.json({
            message: 'Location updated',
            data: tracking
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error })
    }
}

export const triggerSOS = async (req: Request, res: Response) => {
    const { bookingId, userId, role, message, location } = req.body

    if (!bookingId || !userId) {
        return res.status(400).json({ message: 'bookingId và userId là bắt buộc.' })
    }

    try {
        const BookingModel = (await import('../models/Booking.model')).default

        // Lưu thông tin SOS vào Booking
        const updateData: any = {
            emergencyTriggeredAt: new Date(),
            emergencyTriggeredBy: userId,
            emergencyRole: role || 'unknown'
        }
        if (location) {
            updateData.emergencyLocation = {
                lat: location.lat,
                lng: location.lng,
                timestamp: location.timestamp || new Date()
            }
        }
        const booking = await BookingModel.findByIdAndUpdate(bookingId, updateData, { new: true })
            .populate('touristId', 'name email phone')
            .populate('buddyId', 'name email phone')

        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy booking.' })
        }

        const io = getIO()

        // 1. Gửi đến phòng Admin để Admin nhận SOS alert với đầy đủ thông tin
        io.to('admin_room').emit('sos_alert', {
            bookingId,
            bookingCode: (booking as any).bookingCode,
            userId,
            role: role || 'unknown',
            senderName: role === 'tourist'
                ? (booking as any).touristId?.name
                : (booking as any).buddyId?.name,
            touristName: (booking as any).touristId?.name,
            buddyName: (booking as any).buddyId?.name,
            touristPhone: (booking as any).touristId?.phone,
            buddyPhone: (booking as any).buddyId?.phone,
            message: message || 'Người dùng nhấn SOS.',
            timestamp: new Date(),
            location
        })

        // 2. Broadcast vào booking room để Tourist và Buddy đều nhận được
        io.emit(`sos_triggered_${bookingId}`, {
            bookingId,
            userId,
            role: role || 'unknown',
            message: message || 'KHẨN CẤP!',
            timestamp: new Date(),
            location
        })

        res.json({
            message: 'SOS triggered successfully. Admin has been notified.',
            booking: {
                bookingCode: (booking as any).bookingCode,
                emergencyTriggeredAt: updateData.emergencyTriggeredAt
            }
        })
    } catch (error) {
        console.error('[SOS] Error:', error)
        res.status(500).json({ message: 'Server error', error })
    }
}

// Admin giải quyết SOS
export const resolveSOS = async (req: Request, res: Response) => {
    const { bookingId } = req.params
    const { note } = req.body // Admin ghi chú kết quả xử lý

    if (!bookingId) {
        return res.status(400).json({ message: 'bookingId là bắt buộc.' })
    }

    try {
        const BookingModel = (await import('../models/Booking.model')).default

        const booking = await BookingModel.findByIdAndUpdate(
            bookingId,
            {
                emergencyResolvedAt: new Date(),
                emergencyResolvedNote: note || ''
            },
            { new: true }
        )

        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy booking.' })
        }

        const io = getIO()

        // Thông báo cho Tourist và Buddy biết SOS đã được xử lý
        io.emit(`sos_resolved_${bookingId}`, {
            bookingId,
            resolvedAt: new Date(),
            resolvedBy: 'admin',
            note: note || 'Admin đã xử lý xong sự cố.'
        })

        // Thông báo cho admin_room biết đã resolve
        io.to('admin_room').emit('sos_resolved_notification', {
            bookingId,
            resolvedAt: new Date(),
            note
        })

        res.json({
            message: 'SOS đã được giải quyết. Tourist và Buddy đã được thông báo.',
            booking
        })
    } catch (error) {
        console.error('[SOS Resolve] Error:', error)
        res.status(500).json({ message: 'Server error', error })
    }
}

// Admin lấy danh sách SOS đang active
export const getActiveSOS = async (req: Request, res: Response) => {
    try {
        const BookingModel = (await import('../models/Booking.model')).default

        const activeSOSList = await BookingModel.find({
            emergencyTriggeredAt: { $exists: true, $ne: null },
            emergencyResolvedAt: { $exists: false }
        })
            .populate('touristId', 'name phone email')
            .populate('buddyId', 'name phone email')
            .populate('experienceId', 'title')
            .sort({ emergencyTriggeredAt: -1 })

        // Ngoài ra, lấy danh sách SOS đã xử lý (giới hạn 50 cái gần nhất)
        const resolvedSOSList = await BookingModel.find({
            emergencyTriggeredAt: { $exists: true, $ne: null },
            emergencyResolvedAt: { $exists: true, $ne: null }
        })
            .populate('touristId', 'name phone email')
            .populate('buddyId', 'name phone email')
            .populate('experienceId', 'title')
            .sort({ emergencyResolvedAt: -1 })
            .limit(50)

        res.json({
            message: 'Lấy danh sách SOS thành công',
            activeSOS: activeSOSList,
            resolvedSOS: resolvedSOSList
        })
    } catch (error) {
        console.error('[SOS List] Error:', error)
        res.status(500).json({ message: 'Server error', error })
    }
}
