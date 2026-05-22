import { ObjectId } from 'mongodb'
import { Schema } from 'mongoose'

export interface IMessage {
    _id?: ObjectId
    conversationId: ObjectId
    senderId: ObjectId
    content: string
    type?: string // 'text', 'image', 'location'
    isRead?: boolean
    created_at?: Date
    updated_at?: Date
}

export const messageSchema = new Schema<IMessage>(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: 'Conversations', required: true },
        senderId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        content: { type: String, required: true },
        type: { type: String, default: 'text' }, // 'text', 'image', 'location'
        isRead: { type: Boolean, default: false }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        collection: 'messages'
    }
)

