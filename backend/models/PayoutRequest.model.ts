import mongoose from 'mongoose'
import { payoutRequestSchema, IPayoutRequest } from './schemas/PayoutRequest.schema'

const PayoutRequestModel = mongoose.model<IPayoutRequest>('PayoutRequests', payoutRequestSchema)
export default PayoutRequestModel
