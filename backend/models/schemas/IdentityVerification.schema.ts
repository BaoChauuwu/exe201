import { ObjectId } from 'mongodb'
import { Schema } from 'mongoose'

export interface IIdentityVerification {
    _id?: ObjectId
    userId: ObjectId
    docType: string // 'cccd', 'passport', 'student_id'
    docFrontUrl: string
    docBackUrl?: string
    selfieUrl: string
    status?: string // 'pending', 'approved', 'rejected'
    rejectedReason?: string
    created_at?: Date
    updated_at?: Date
}

export const identityVerificationSchema = new Schema<IIdentityVerification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        docType: { type: String, required: true }, // 'cccd', 'passport', 'student_id'
        docFrontUrl: { type: String, required: true },
        docBackUrl: { type: String, default: '' },
        selfieUrl: { type: String, required: true },
        status: { type: String, default: 'pending' }, // 'pending', 'approved', 'rejected'
        rejectedReason: { type: String, default: '' }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        collection: 'identity_verifications'
    }
)

