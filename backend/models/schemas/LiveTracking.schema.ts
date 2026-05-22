import { ObjectId } from 'mongodb'
import { Schema } from 'mongoose'

export interface ILiveTracking {
    _id?: ObjectId
    bookingId: ObjectId
    buddyId: ObjectId
    location: {
        type: string // 'Point'
        coordinates: number[] // [lng, lat]
    }
    recordedAt?: Date
}

export const liveTrackingSchema = new Schema<ILiveTracking>(
    {
        bookingId: { type: Schema.Types.ObjectId, ref: 'Bookings', required: true },
        buddyId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        location: {
            type: { type: String, enum: ['Point'], required: true },
            coordinates: { type: [Number], required: true }
        },
        recordedAt: { type: Date, default: Date.now }
    },
    {
        timestamps: false,
        collection: 'live_tracking'
    }
)

