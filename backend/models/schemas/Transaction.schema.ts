import { ObjectId } from 'mongodb'
import { Schema } from 'mongoose'

export interface ITransaction {
    _id?: ObjectId
    bookingId?: ObjectId
    payerId: ObjectId
    type: string // 'payment', 'refund', 'premium'
    amount: number
    currency?: string
    paymentMethod: string // 'MoMo', 'VNPay'
    gatewayTransactionId?: string
    status?: string // 'success', 'failed', 'pending'
    created_at?: Date
    updated_at?: Date
}

export const transactionSchema = new Schema<ITransaction>(
    {
        bookingId: { type: Schema.Types.ObjectId, ref: 'Bookings' },
        payerId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        type: { type: String, required: true }, // 'payment', 'refund', 'premium'
        amount: { type: Number, required: true },
        currency: { type: String, default: 'VND' },
        paymentMethod: { type: String, required: true }, // 'MoMo', 'VNPay'
        gatewayTransactionId: { type: String, default: '' },
        status: { type: String, default: 'pending' } // 'success', 'failed', 'pending'
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        collection: 'transactions'
    }
)

