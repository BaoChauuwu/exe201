import mongoose from 'mongoose'
import { reviewSchema, IReview } from './schemas/Review.schema'

const ReviewModel = mongoose.model<IReview>('Reviews', reviewSchema)
export default ReviewModel
