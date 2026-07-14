import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { ObjectId } from 'mongodb'
import PayoutRequest from '../models/PayoutRequest.model'
import BuddyProfile from '../models/BuddyProfile.model'
import UserModel from '../models/User.model'

export const requestPayout = async (req: Request, res: Response) => {
    const { buddyId, amount, bankCode, accountNumber, accountName } = req.body

    // Start MongoDB Session for Transaction
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        // 1. Fetch Buddy Profile
        const profile = await BuddyProfile.findOne({ userId: new ObjectId(buddyId) }).session(session)
        
        if (!profile) {
            // Check if it's a Tourist user instead
            const user = await UserModel.findById(new ObjectId(buddyId)).session(session)
            if (!user) {
                await session.abortTransaction()
                session.endSession()
                return res.status(404).json({ message: 'User profile not found' })
            }

            // Validate User Wallet Balance
            if (!user.walletBalance || user.walletBalance < amount) {
                await session.abortTransaction()
                session.endSession()
                return res.status(400).json({ message: 'Insufficient wallet balance' })
            }

            // Deduct User Wallet Balance
            user.walletBalance -= amount
            // Save as default refund payment method for next times
            user.refundPaymentMethod = { bankCode, accountNumber, accountName }
            await user.save({ session })

            // Create Payout Request
            const payoutReq = await PayoutRequest.create([{
                buddyId: user._id,
                amount,
                payoutMethod: {
                    bankCode,
                    accountNumber,
                    accountName
                },
                status: 'pending'
            }], { session })

            // Commit Transaction
            await session.commitTransaction()
            session.endSession()

            return res.json({
                message: 'Payout request submitted successfully',
                data: payoutReq[0]
            })
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

export const depositWallet = async (req: Request, res: Response) => {
    const { userId, amount } = req.body
    const depositAmount = Number(amount)

    if (!userId || !depositAmount || depositAmount <= 0) {
        return res.status(400).json({ message: 'Số tiền nạp không hợp lệ' })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const user = await UserModel.findById(new ObjectId(userId)).session(session)
        if (!user) {
            await session.abortTransaction()
            session.endSession()
            return res.status(404).json({ message: 'Không tìm thấy người dùng' })
        }

        user.walletBalance = (user.walletBalance || 0) + depositAmount
        await user.save({ session })

        if (user.role === 'buddy') {
            const profile = await BuddyProfile.findOne({ userId: new ObjectId(userId) }).session(session)
            if (profile) {
                profile.walletBalance = (profile.walletBalance || 0) + depositAmount
                await profile.save({ session })
            }
        }

        await session.commitTransaction()
        session.endSession()

        return res.json({
            message: 'Nạp tiền vào ví thành công',
            data: {
                walletBalance: user.walletBalance
            }
        })
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        return res.status(500).json({ message: 'Nạp tiền thất bại', error })
    }
}

