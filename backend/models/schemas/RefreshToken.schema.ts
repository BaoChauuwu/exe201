import { ObjectId } from 'mongodb'
import mongoose, { Schema } from 'mongoose'

export interface IRefreshToken {
    _id?: ObjectId
    token: string
    created_at?: Date
    user_id: ObjectId
}

export const refreshTokenSchema = new Schema<IRefreshToken>(
    {
        token: { type: String, required: true },
        user_id: { type: Schema.Types.ObjectId, ref: 'Users', required: true }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: false
        },
        collection: 'refresh_tokens'
    }
)