import { ObjectId } from 'mongodb'
import { Schema } from 'mongoose'

export interface IPayoutRequest {
    _id?: ObjectId
    buddyId: ObjectId
    amount: number
    currency?: string
    payoutMethod: {
        bankCode: string
        accountNumber: string
        accountName: string
    }
    status?: string // 'pending', 'completed', 'rejected'
    rejectionReason?: string
    transactionReceiptUrl?: string
    created_at?: Date
    updated_at?: Date
}

export const payoutRequestSchema = new Schema<IPayoutRequest>(
    {
        buddyId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'VND' },
        payoutMethod: {
            bankCode: { type: String, required: true },
            accountNumber: { type: String, required: true },
            accountName: { type: String, required: true }
        },
        status: { type: String, default: 'pending' }, // 'pending', 'completed', 'rejected'
        rejectionReason: { type: String, default: '' },
        transactionReceiptUrl: { type: String, default: '' }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        collection: 'payout_requests'
    }
)

