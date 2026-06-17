import { ObjectId } from 'mongodb'
import { Schema } from 'mongoose'

export interface IExperience {
    _id?: ObjectId
    buddyId: ObjectId
    title: string
    description: string
    category: string
    city: string
    price: number
    currency?: string
    minHours?: number
    maxGroupSize?: number
    images?: string[]
    includedItems?: string[]
    meetingPoint?: {
        type: string // 'Point'
        coordinates: number[] // [longitude, latitude]
    }
    avgRating?: number
    totalBookings?: number
    isActive?: boolean
    isApproved?: boolean
    status?: 'pending' | 'approved' | 'rejected'
    created_at?: Date
    updated_at?: Date
}

export const experienceSchema = new Schema<IExperience>(
    {
        buddyId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, required: true },
        city: { type: String, required: true },
        price: { type: Number, required: true },
        currency: { type: String, default: 'VND' },
        minHours: { type: Number, default: 1 },
        maxGroupSize: { type: Number, default: 1 },
        images: { type: [String], default: [] },
        includedItems: { type: [String], default: [] },
        meetingPoint: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] }
        },
        avgRating: { type: Number, default: 0 },
        totalBookings: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        isApproved: { type: Boolean, default: false },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        collection: 'experiences'
    }
)

experienceSchema.index({ meetingPoint: '2dsphere' })
