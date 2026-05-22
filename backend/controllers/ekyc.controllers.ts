import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { identityVerificationSchema, IIdentityVerification } from '../models/schemas/IdentityVerification.schema'
import { TokenPayload } from '../models/requests/User.requests'

import httpStatus from '../constants/httpStatus'

const IdentityVerification = mongoose.models.IdentityVerifications || mongoose.model<IIdentityVerification>('IdentityVerifications', identityVerificationSchema)

export const submitEkyc = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { idCardFrontUrl, idCardBackUrl, selfieUrl } = req.body

    try {
        // Check if user already submitted eKYC
        const existing = await IdentityVerification.findOne({ userId: new mongoose.Types.ObjectId(user_id) })
        if (existing && (existing.status === 'pending' || existing.status === 'approved')) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'You have already submitted eKYC or it is approved.'
            })
        }

        const ekycData = {
            userId: new mongoose.Types.ObjectId(user_id),
            docType: 'cccd',
            docFrontUrl: idCardFrontUrl,
            docBackUrl: idCardBackUrl,
            selfieUrl,
            status: 'pending'
        }

        if (existing) {
            // Update rejected eKYC
            existing.docType = 'cccd'
            existing.docFrontUrl = idCardFrontUrl
            existing.docBackUrl = idCardBackUrl
            existing.selfieUrl = selfieUrl
            existing.status = 'pending'
            await existing.save()
            return res.status(httpStatus.OK).json({ message: 'eKYC resubmitted successfully', data: existing })
        }

        const newEkyc = await IdentityVerification.create(ekycData)
        return res.status(httpStatus.CREATED).json({ message: 'eKYC submitted successfully', data: newEkyc })
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server Error', error })
    }
}
