import mongoose from 'mongoose'
import { transactionSchema, ITransaction } from './schemas/Transaction.schema'

const TransactionModel = mongoose.model<ITransaction>('Transactions', transactionSchema)
export default TransactionModel
