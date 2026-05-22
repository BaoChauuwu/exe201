import { ObjectId } from 'mongodb'
import mongoose, { Schema } from 'mongoose'
import { UserVerifyStatus } from '../../constants/enum'

export interface IUser {
    _id?: ObjectId
    authProvider?: string // 'local', 'google', 'apple'
    providerId?: string
    name?: string // full name
    email: string
    phone?: string
    date_of_birth?: Date
    password?: string // hashed password
    role?: string // 'tourist', 'buddy', 'admin'
    nationality?: string
    isVerified?: boolean
    isActive?: boolean
    deviceTokens?: string[]
    deletedAt?: Date | null
    created_at?: Date
    updated_at?: Date

    email_verify_token?: string
    forgot_password_token?: string
    verify?: UserVerifyStatus

    bio?: string
    location?: string
    website?: string
    username?: string
    avatar?: string
    cover_photo?: string
}

export const userSchema = new Schema<IUser>(
    {
        authProvider: { type: String, default: 'local' },
        providerId: { type: String, default: '' },
        name: { type: String, default: '' },
        email: { type: String, required: true, unique: true },
        phone: { type: String, default: '' },
        date_of_birth: { type: Date, default: Date.now },
        password: { type: String, default: '' },
        role: { type: String, default: 'tourist' },
        nationality: { type: String, default: '' },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        deviceTokens: { type: [String], default: [] },
        deletedAt: { type: Date, default: null },
        email_verify_token: { type: String, default: '' },
        forgot_password_token: { type: String, default: '' },
        verify: { type: Number, enum: UserVerifyStatus, default: UserVerifyStatus.Unverified },
        bio: { type: String, default: '' },
        location: { type: String, default: '' },
        website: { type: String, default: '' },
        username: { type: String, default: '' },
        avatar: { type: String, default: '' },
        cover_photo: { type: String, default: '' }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        collection: 'users'
    }
)
