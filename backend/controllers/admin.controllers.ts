import { Request, Response } from 'express'
import mongoose from 'mongoose'
import databaseService from '../services/database.services'
import { ObjectId } from 'mongodb'
import httpStatus from '../constants/httpStatus'
import IdentityVerification from '../models/IdentityVerification.model'
import PayoutRequest from '../models/PayoutRequest.model'
import BuddyProfile from '../models/BuddyProfile.model'
import ExperienceModel from '../models/Experience.model'
import UserModel from '../models/User.model'
import BookingModel from '../models/Booking.model'

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
            // Refund the buddy's wallet or tourist's wallet
            const profile = await BuddyProfile.findOne({ userId: payout.buddyId }).session(session)
            if (profile) {
                profile.walletBalance += payout.amount
                await profile.save({ session })
            } else {
                const user = await UserModel.findById(payout.buddyId).session(session)
                if (user) {
                    user.walletBalance = (user.walletBalance || 0) + payout.amount
                    await user.save({ session })
                }
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
        if (!ObjectId.isValid(String(id))) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid user ID' });
        }
        
        const user = await databaseService.users.findOne({ _id: new ObjectId(String(id)) });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
        }
        
        if (user.role === 'admin') {
            return res.status(httpStatus.FORBIDDEN).json({ message: 'Cannot delete an admin user' });
        }

        await databaseService.users.deleteOne({ _id: new ObjectId(String(id)) });
        return res.status(httpStatus.OK).json({ message: 'User deleted successfully' });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error });
    }
}

// Experience Management for Admin
export const getPendingExperiences = async (req: Request, res: Response) => {
    try {
        const experiences = await ExperienceModel.find({
            $or: [
                { status: 'pending' },
                { status: { $exists: false }, isApproved: false }
            ]
        })
            .populate('buddyId', 'name email avatar')
            .sort({ created_at: -1 })
        return res.status(httpStatus.OK).json({ data: experiences })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error })
    }
}

export const approveExperience = async (req: Request, res: Response) => {
    const { experienceId, status } = req.body // status: 'approved' | 'rejected'
    
    try {
        const experience = await ExperienceModel.findById(experienceId)
        if (!experience) return res.status(httpStatus.NOT_FOUND).json({ message: 'Tour không tồn tại' })

        if (status === 'approved') {
            experience.isApproved = true
            experience.status = 'approved'
            await experience.save()
            return res.status(httpStatus.OK).json({ message: 'Đã duyệt tour thành công!' })
        } else {
            // rejection: set isApproved to false and status to 'rejected'
            experience.isApproved = false
            experience.status = 'rejected'
            await experience.save()
            return res.status(httpStatus.OK).json({ message: 'Đã từ chối tour thành công!' })
        }
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error })
    }
}

// Booking / Trip Management for Admin
export const getAllBookings = async (req: Request, res: Response) => {
    try {
        const { status } = req.query
        const filter: Record<string, any> = {}
        if (status && status !== 'all') {
            filter.status = status
        }

        const bookings = await BookingModel.find(filter)
            .sort({ created_at: -1 })
            .populate('touristId', 'name email avatar')
            .populate('buddyId', 'name email avatar')
            .populate('experienceId', 'title city images')
            .lean()

        return res.status(httpStatus.OK).json({ data: bookings })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error })
    }
}

// Tracking & SOS Management
import LiveTrackingModel from '../models/LiveTracking.model'

export const getActiveTracking = async (req: Request, res: Response) => {
    try {
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        
        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        const activeBookings = await BookingModel.find({
            $or: [
                { emergencyTriggeredAt: { $exists: true, $ne: null } },
                { scheduledDate: { $gte: startOfDay, $lte: endOfDay } },
                { status: { $in: ['confirmed', 'ongoing'] } }
            ]
        }).populate('touristId', 'name email').populate('buddyId', 'name email').populate('experienceId', 'title')

        const trackingData = await Promise.all(activeBookings.map(async (booking: any) => {
            const touristTracking = await LiveTrackingModel.findOne({ bookingId: booking._id, role: 'tourist' })
            const buddyTracking = await LiveTrackingModel.findOne({ bookingId: booking._id, role: 'buddy' })

            return {
                bookingId: booking._id,
                bookingCode: booking.bookingCode,
                tourist: booking.touristId,
                buddy: booking.buddyId,
                experience: booking.experienceId,
                scheduledDate: booking.scheduledDate,
                startTime: booking.startTime,
                hours: booking.hours,
                status: booking.status,
                emergencyTriggeredAt: booking.emergencyTriggeredAt,
                emergencyLocation: booking.emergencyLocation,
                touristLocation: touristTracking ? touristTracking.location.coordinates : null,
                touristLastUpdated: touristTracking ? touristTracking.recordedAt : null,
                buddyLocation: buddyTracking ? buddyTracking.location.coordinates : null,
                buddyLastUpdated: buddyTracking ? buddyTracking.recordedAt : null,
            }
        }))

        return res.status(httpStatus.OK).json({ data: trackingData })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error })
    }
}

export const resolveSOS = async (req: Request, res: Response) => {
    const { bookingId } = req.body
    try {
        await BookingModel.findByIdAndUpdate(bookingId, {
            $unset: { emergencyTriggeredAt: "", emergencyLocation: "" }
        })
        
        const { getIO } = await import('../socket')
        const io = getIO()
        io.emit(`sos_resolved_${bookingId}`, { bookingId })

        return res.status(httpStatus.OK).json({ message: 'Đã xử lý báo động SOS thành công!' })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error })
    }
}
