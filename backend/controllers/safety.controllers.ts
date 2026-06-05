import { Request, Response } from 'express'
import { getIO } from '../socket'
import { ObjectId } from 'mongodb'
import LiveTracking from '../models/LiveTracking.model'

export const updateLocation = async (req: Request, res: Response) => {
    const { bookingId, buddyId, lng, lat, role } = req.body

    try {
        let tracking = null
        if (!role || role === 'buddy') {
            tracking = await LiveTracking.create({
                bookingId: new ObjectId(bookingId as string),
                buddyId: new ObjectId(buddyId as string),
                location: {
                    type: 'Point',
                    coordinates: [lng, lat]
                }
            })
        }

        const io = getIO()
        io.emit(`location_updated_${bookingId}`, { lat, lng, role: role || 'buddy', senderId: buddyId })

        res.json({
            message: 'Location updated',
            data: tracking
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error })
    }
}

export const triggerSOS = async (req: Request, res: Response) => {
    const { bookingId, userId, message } = req.body

    try {
        // In a real app, save to a Notifications/Alerts table here
        
        // Push alert to admin room via Socket.io
        const io = getIO()
        io.to('admin_room').emit('sos_alert', {
            bookingId,
            userId,
            message,
            timestamp: new Date()
        })

        res.json({
            message: 'SOS triggered successfully. Admin has been notified.'
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error })
    }
}
