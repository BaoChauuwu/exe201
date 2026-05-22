import { ObjectId } from 'mongodb'
import mongoose, { Schema } from 'mongoose'

export interface IAvailabilitySlot {
    _id?: ObjectId
    buddyId: ObjectId
    date: Date
    startTime: string
    endTime: string
    status: string // 'booked', 'blocked'
    bookingId?: ObjectId
    created_at?: Date
    updated_at?: Date
}

export const availabilitySlotSchema = new Schema<IAvailabilitySlot>(
    {
        buddyId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        date: { type: Date, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        status: { type: String, required: true }, // 'booked', 'blocked'
        bookingId: { type: Schema.Types.ObjectId, ref: 'Bookings' }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        collection: 'availability_slots'
    }
)
