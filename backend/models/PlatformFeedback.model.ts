import mongoose from 'mongoose'
import { IPlatformFeedback, platformFeedbackSchema } from './schemas/PlatformFeedback.schema'

const PlatformFeedbackModel = mongoose.model<IPlatformFeedback>('PlatformFeedbacks', platformFeedbackSchema)

export default PlatformFeedbackModel
