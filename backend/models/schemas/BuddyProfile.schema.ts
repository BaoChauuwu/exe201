import { ObjectId } from 'mongodb'
import mongoose, { Schema } from 'mongoose'

export interface IBuddyProfile {
    _id?: ObjectId
    userId: ObjectId
    bio?: string
    tagline?: string
    languages?: string[]
    specialties?: string[]
    city?: string
    isPremium?: boolean
    premiumExpiresAt?: Date
    rating?: number
    totalReviews?: number
    totalCompletedTours?: number
    payoutMethod?: {
        bankCode: string
        accountNumber: string
        accountName: string
    }
    walletBalance?: number
    pendingBalance?: number
    availability?: string[]
    isAvailable?: boolean
    isApproved?: boolean
    hourlyRate?: number
    created_at?: Date
    updated_at?: Date
}

export const buddyProfileSchema = new Schema<IBuddyProfile>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        bio: { type: String, default: '' },
        tagline: { type: String, default: '' },
        languages: { type: [String], default: [] },
        specialties: { type: [String], default: [] },
        city: { type: String, default: '' },
        isPremium: { type: Boolean, default: false },
        premiumExpiresAt: { type: Date },
        rating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
        totalCompletedTours: { type: Number, default: 0 },
        payoutMethod: {
            bankCode: { type: String },
            accountNumber: { type: String },
            accountName: { type: String }
        },
        walletBalance: { type: Number, default: 0 },
        pendingBalance: { type: Number, default: 0 },
        availability: { type: [String], default: [] },
        isAvailable: { type: Boolean, default: false },
        isApproved: { type: Boolean, default: false },
        hourlyRate: { type: Number, default: 0 }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        collection: 'buddy_profiles'
    }
)
