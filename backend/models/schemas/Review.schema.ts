import { ObjectId } from 'mongodb'
import { Schema } from 'mongoose'

export interface IReview {
    _id?: ObjectId
    bookingId: ObjectId
    reviewerId: ObjectId
    targetId: ObjectId
    experienceId: ObjectId
    type: string // 'tourist_to_buddy', 'buddy_to_tourist'
    rating: number
    comment?: string
    isPublic?: boolean
    created_at?: Date
    updated_at?: Date
}

export const reviewSchema = new Schema<IReview>(
    {
        bookingId: { type: Schema.Types.ObjectId, ref: 'Bookings', required: true },
        reviewerId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        targetId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        experienceId: { type: Schema.Types.ObjectId, ref: 'Experiences', required: true },
        type: { type: String, required: true }, // 'tourist_to_buddy', 'buddy_to_tourist'
        rating: { type: Number, required: true },
        comment: { type: String, default: '' },
        isPublic: { type: Boolean, default: true }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        collection: 'reviews'
    }
)

