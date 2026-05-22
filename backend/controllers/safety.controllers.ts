import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { liveTrackingSchema, ILiveTracking } from '../models/schemas/LiveTracking.schema'
import { getIO } from '../socket'
import { ObjectId } from 'mongodb'

const LiveTracking = mongoose.models.LiveTrackings || mongoose.model<ILiveTracking>('LiveTrackings', liveTrackingSchema)

export const updateLocation = async (req: Request, res: Response) => {
    const { bookingId, buddyId, lng, lat } = req.body

    try {
        const tracking = await LiveTracking.create({
            bookingId: new ObjectId(bookingId),
            buddyId: new ObjectId(buddyId),
            location: {
                type: 'Point',
                coordinates: [lng, lat]
            }
        })

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
