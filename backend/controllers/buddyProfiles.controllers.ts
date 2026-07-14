import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { IBuddyProfile } from '../models/schemas/BuddyProfile.schema'
import { TokenPayload } from '../models/requests/User.requests'
import { ObjectId } from 'mongodb'
import httpStatus from '../constants/httpStatus'
import BuddyProfile from '../models/BuddyProfile.model'

export const getMyBuddyProfile = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload

    try {
        const profile = await BuddyProfile.findOne({ userId: new ObjectId(user_id) })
        if (!profile) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Buddy profile not found' })
        }
        return res.status(httpStatus.OK).json({ message: 'Get buddy profile successfully', data: profile })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error })
    }
}

export const updateBuddyProfile = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { availability, languages, bankCode, accountNumber, accountName, hourlyRate, personalityTags } = req.body

    try {
        const profile = await BuddyProfile.findOne({ userId: new ObjectId(user_id) })
        
        if (profile) {
            if (availability) profile.availability = availability
            if (languages) profile.languages = languages
            if (hourlyRate !== undefined) profile.hourlyRate = hourlyRate
            if (personalityTags !== undefined) profile.personalityTags = personalityTags
            
            if (!profile.payoutMethod) profile.payoutMethod = { bankCode: '', accountNumber: '', accountName: '' }
            if (bankCode) profile.payoutMethod.bankCode = bankCode
            if (accountNumber) profile.payoutMethod.accountNumber = accountNumber
            if (accountName) profile.payoutMethod.accountName = accountName
            
            await profile.save()


            return res.status(httpStatus.OK).json({ message: 'Buddy profile updated successfully', data: profile })
        } else {
            const newProfile = await BuddyProfile.create({
                userId: new ObjectId(user_id),
                availability: availability || [],
                languages: languages || [],
                hourlyRate: hourlyRate || 0,
                walletBalance: 0,
                personalityTags: personalityTags || [],
                payoutMethod: { bankCode, accountNumber, accountName }
            })
            return res.status(httpStatus.CREATED).json({ message: 'Buddy profile created successfully', data: newProfile })
        }
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error })
    }
}

export const getAllBuddies = async (req: Request, res: Response) => {
    try {
        const buddies = await BuddyProfile.find().populate('userId', 'name avatar location username email role verify');
        return res.status(httpStatus.OK).json({ message: 'Get all buddies successfully', data: buddies });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error });
    }
}

export const getBuddyProfileById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        let profile = null;
        if (ObjectId.isValid(String(id))) {
            profile = await BuddyProfile.findOne({
                $or: [{ _id: new ObjectId(String(id)) }, { userId: new ObjectId(String(id)) }]
            }).populate('userId', 'name avatar location username email role verify');
        }
        
        if (!profile) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Buddy not found' });
        }
        return res.status(httpStatus.OK).json({ message: 'Get buddy profile successfully', data: profile });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error });
    }
}
