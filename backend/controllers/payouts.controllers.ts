import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { ObjectId } from 'mongodb'
import PayoutRequest from '../models/PayoutRequest.model'
import BuddyProfile from '../models/BuddyProfile.model'

export const requestPayout = async (req: Request, res: Response) => {
    const { buddyId, amount, bankCode, accountNumber, accountName } = req.body

    // Start MongoDB Session for Transaction
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        // 1. Fetch Buddy Profile
        const profile = await BuddyProfile.findOne({ userId: new ObjectId(buddyId) }).session(session)
        
        if (!profile) {
            await session.abortTransaction()
            session.endSession()
            return res.status(404).json({ message: 'Buddy profile not found' })
        }

        // 2. Validate Balance
        if (!profile.walletBalance || profile.walletBalance < amount) {
            await session.abortTransaction()
            session.endSession()
            return res.status(400).json({ message: 'Insufficient wallet balance' })
        }

        // 3. Deduct Balance
        profile.walletBalance -= amount
        await profile.save({ session })

        // 4. Create Payout Request
        const payoutReq = await PayoutRequest.create([{
            buddyId: profile.userId,
            amount,
            payoutMethod: {
                bankCode,
                accountNumber,
                accountName
            },
            status: 'pending'
        }], { session })

        // 5. Commit Transaction
        await session.commitTransaction()
        session.endSession()

        res.json({
            message: 'Payout request submitted successfully',
            data: payoutReq[0]
        })
    } catch (error) {
        // If anything fails, abort the transaction
        await session.abortTransaction()
        session.endSession()
        res.status(500).json({ message: 'Transaction failed, rolled back.', error })
    }
}
