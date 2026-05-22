import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { identityVerificationSchema, IIdentityVerification } from '../models/schemas/IdentityVerification.schema'
import { payoutRequestSchema, IPayoutRequest } from '../models/schemas/PayoutRequest.schema'
import databaseService from '../services/database.services'
import { ObjectId } from 'mongodb'
import httpStatus from '../constants/httpStatus'

const IdentityVerification = mongoose.models.IdentityVerifications || mongoose.model<IIdentityVerification>('IdentityVerifications', identityVerificationSchema)
const PayoutRequest = mongoose.models.PayoutRequests || mongoose.model<IPayoutRequest>('PayoutRequests', payoutRequestSchema)

// eKYC Management
export const getPendingEkyc = async (req: Request, res: Response) => {
    try {
        const ekycs = await IdentityVerification.find({ status: 'pending' }).sort({ created_at: -1 })
        return res.status(httpStatus.OK).json({ data: ekycs })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error })
    }
}

export const approveEkyc = async (req: Request, res: Response) => {
    const { ekycId, status } = req.body // status: 'approved' | 'rejected'
    
    try {
        const ekyc = await IdentityVerification.findById(ekycId)
        if (!ekyc) return res.status(httpStatus.NOT_FOUND).json({ message: 'eKYC not found' })

        ekyc.status = status
        ekyc.updated_at = new Date()
        await ekyc.save()

        if (status === 'approved') {
            // Update user verify status
            await databaseService.users.updateOne(
                { _id: new ObjectId(ekyc.userId) },
                { $set: { verify: 1 } }
            )
        }

        return res.status(httpStatus.OK).json({ message: `eKYC ${status} successfully` })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error })
    }
}

// Payout Management
export const getPendingPayouts = async (req: Request, res: Response) => {
    try {
        const payouts = await PayoutRequest.find({ status: 'pending' }).sort({ created_at: -1 })
        return res.status(httpStatus.OK).json({ data: payouts })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error })
    }
}

export const approvePayout = async (req: Request, res: Response) => {
    const { payoutId, status } = req.body // status: 'approved' | 'rejected'
    
    // Using transaction for payout approval/rejection
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const payout = await PayoutRequest.findById(payoutId).session(session)
        if (!payout) {
            await session.abortTransaction()
            session.endSession()
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Payout request not found' })
        }

        payout.status = status
        payout.updated_at = new Date()
        await payout.save({ session })

        if (status === 'rejected') {
            // Refund the buddy's wallet
            const BuddyProfile = mongoose.models.BuddyProfiles
            const profile = await BuddyProfile.findOne({ userId: payout.buddyId }).session(session)
            if (profile) {
                profile.walletBalance += payout.amount
                await profile.save({ session })
            }
        }

        await session.commitTransaction()
        session.endSession()

        return res.status(httpStatus.OK).json({ message: `Payout request ${status} successfully` })
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error })
    }
}

// User Management
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await databaseService.users.find({}, { projection: { password: 0, forgot_password_token: 0, email_verify_token: 0 } }).sort({ created_at: -1 }).toArray();
        return res.status(httpStatus.OK).json({ data: users });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error });
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        if (!ObjectId.isValid(id)) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid user ID' });
        }
        
        const user = await databaseService.users.findOne({ _id: new ObjectId(id) });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
        }
        
        if (user.role === 'admin') {
            return res.status(httpStatus.FORBIDDEN).json({ message: 'Cannot delete an admin user' });
        }

        await databaseService.users.deleteOne({ _id: new ObjectId(id) });
        return res.status(httpStatus.OK).json({ message: 'User deleted successfully' });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error });
    }
}
