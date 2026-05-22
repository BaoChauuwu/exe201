import mongoose, { Schema, Types } from 'mongoose'

export interface IAdvertisement {
    _id?: Types.ObjectId
    businessName: string
    type: string // 'banner', 'priority_listing'
    targetCity: string
    content: any // Text and images for rendering
    monthlyFee: number
    startDate: Date
    endDate: Date
    isActive?: boolean
    clicks?: number
    created_at?: Date
    updated_at?: Date
}

export const advertisementSchema = new Schema<IAdvertisement>(
    {
        businessName: { type: String, required: true },
        type: { type: String, required: true }, // 'banner', 'priority_listing'
        targetCity: { type: String, required: true },
        content: { type: Schema.Types.Mixed, required: true },
        monthlyFee: { type: Number, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        clicks: { type: Number, default: 0 }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        collection: 'advertisements'
    }
)
