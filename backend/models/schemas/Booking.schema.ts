import { ObjectId } from 'mongodb'
import mongoose, { Schema } from 'mongoose'

export interface IBooking {
    _id?: ObjectId
    bookingCode: string
    touristId: ObjectId
    buddyId: ObjectId
    experienceId: ObjectId
    scheduledDate: Date
    startTime: string
    hours: number
    groupSize: number
    actualStartTime?: Date
    actualEndTime?: Date
    meetingPoint?: {
        type: string
        coordinates: number[]
    }
    pricePerHourSnapshot: number
    currency?: string
    totalPrice: number
    commissionAmount: number
    buddyEarning: number
    paymentStatus?: string // 'paid', 'unpaid'
    paymentMethod?: string
    status?: string // 'pending', 'confirmed', 'ongoing', 'completed', 'cancelled'
    cancelReason?: string
    emergencyTriggeredAt?: Date
    created_at?: Date
    updated_at?: Date
}

export const bookingSchema = new Schema<IBooking>(
    {
        bookingCode: { type: String, required: true },
        touristId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        buddyId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        experienceId: { type: Schema.Types.ObjectId, ref: 'Experiences', required: true },
        scheduledDate: { type: Date, required: true },
        startTime: { type: String, required: true },
        hours: { type: Number, required: true },
        groupSize: { type: Number, required: true },
        actualStartTime: { type: Date },
        actualEndTime: { type: Date },
        meetingPoint: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] }
        },
        pricePerHourSnapshot: { type: Number, required: true },
        currency: { type: String, default: 'VND' },
        totalPrice: { type: Number, required: true },
        commissionAmount: { type: Number, required: true },
        buddyEarning: { type: Number, required: true },
        paymentStatus: { type: String, default: 'unpaid' },
        paymentMethod: { type: String, default: '' },
        status: { type: String, default: 'pending' },
        cancelReason: { type: String, default: '' },
        emergencyTriggeredAt: { type: Date }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        collection: 'bookings'
    }
)
