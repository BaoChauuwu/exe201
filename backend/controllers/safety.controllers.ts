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
    const { bookingId, userId, message, location } = req.body

    try {
        // Save emergencyTriggeredAt and emergencyLocation to the Booking
        if (bookingId) {
            const BookingModel = (await import('../models/Booking.model')).default
            const updateData: any = { emergencyTriggeredAt: new Date() }
            if (location) {
                updateData.emergencyLocation = {
                    lat: location.lat,
                    lng: location.lng,
                    timestamp: location.timestamp || new Date()
                }
            }
            await BookingModel.findByIdAndUpdate(bookingId, updateData)
        }
        
        // Push alert to admin room via Socket.io
        const io = getIO()
        io.to('admin_room').emit('sos_alert', {
            bookingId,
            userId,
            message,
            timestamp: new Date(),
            location
        })
        
        // Push alert to the booking room so tourist/buddy can see it
        if (bookingId) {
            io.emit(`sos_triggered_${bookingId}`, {
                bookingId,
                userId,
                message,
                timestamp: new Date(),
                location
            })
        }

        res.json({
            message: 'SOS triggered successfully. Admin has been notified.'
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error })
    }
}
