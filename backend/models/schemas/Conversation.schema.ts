import { ObjectId } from 'mongodb'
import mongoose, { Schema } from 'mongoose'

export interface IConversation {
    _id?: ObjectId
    bookingId: ObjectId
    participants: ObjectId[]
    lastMessage?: string
    unreadCounts?: Map<string, number> // e.g. { "userId1": 2, "userId2": 0 }
    created_at?: Date
    updated_at?: Date
}

export const conversationSchema = new Schema<IConversation>(
    {
        bookingId: { type: Schema.Types.ObjectId, ref: 'Bookings', required: true },
        participants: [{ type: Schema.Types.ObjectId, ref: 'Users', required: true }],
        lastMessage: { type: String, default: '' },
        unreadCounts: { type: Map, of: Number, default: () => new Map() }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        collection: 'conversations'
    }
)
