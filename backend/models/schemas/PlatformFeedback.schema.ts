import { ObjectId } from 'mongodb'
import { Schema } from 'mongoose'

export interface IPlatformFeedback {
    _id?: ObjectId
    userId: ObjectId
    type: string // 'testimonial' or 'feedback'
    rating?: number // 1-5 for testimonial
    content: string
    status: string // 'pending', 'approved', 'rejected'
    created_at?: Date
    updated_at?: Date
}

export const platformFeedbackSchema = new Schema<IPlatformFeedback>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        type: { type: String, enum: ['testimonial', 'feedback'], required: true },
        rating: { type: Number, min: 1, max: 5 },
        content: { type: String, required: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        collection: 'platform_feedbacks'
    }
)
