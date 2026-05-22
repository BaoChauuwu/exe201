import { ObjectId } from 'mongodb'
import { Schema } from 'mongoose'

export interface INotification {
    _id?: ObjectId
    userId: ObjectId
    type: string // 'new_booking', 'reminder', 'message'
    title: string
    body: string
    actionId?: ObjectId
    actionModel?: string // 'Booking', 'Conversation', etc.
    isRead?: boolean
    created_at?: Date
    updated_at?: Date
}

export const notificationSchema = new Schema<INotification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        type: { type: String, required: true }, // 'new_booking', 'reminder', 'message'
        title: { type: String, required: true },
        body: { type: String, required: true },
        actionId: { type: Schema.Types.ObjectId },
        actionModel: { type: String, default: '' },
        isRead: { type: Boolean, default: false }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        collection: 'notifications'
    }
)

