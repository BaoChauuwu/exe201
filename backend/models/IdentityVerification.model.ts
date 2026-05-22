import mongoose from 'mongoose'
import { identityVerificationSchema, IIdentityVerification } from './schemas/IdentityVerification.schema'

const IdentityVerificationModel = mongoose.model<IIdentityVerification>('IdentityVerifications', identityVerificationSchema)
export default IdentityVerificationModel
