import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'
import ReviewModel from '~/models/Review.model'
import BookingModel from '~/models/Booking.model'
import BuddyProfileModel from '~/models/BuddyProfile.model'
import ExperienceModel from '~/models/Experience.model'

class ReviewsService {
  async createReview(data: {
    bookingId: string
    reviewerId: string
    rating: number
    comment?: string
  }) {
    const { bookingId, reviewerId, rating, comment = '' } = data

    // 1. Lấy thông tin đặt tour
    const booking = await BookingModel.findById(bookingId)
    if (!booking) {
      throw new Error('Không tìm thấy thông tin đặt tour.')
    }

    // 2. Xác định vai trò
    const isTourist = booking.touristId.toString() === reviewerId
    let type = 'tourist_to_buddy'
    let targetId = booking.buddyId
    
    if (!isTourist) {
      type = 'buddy_to_tourist'
      targetId = booking.touristId
    }

    // 3. Lưu review mới vào database
    const newReview = new ReviewModel({
      bookingId: new ObjectId(bookingId),
      reviewerId: new ObjectId(reviewerId),
      targetId: new ObjectId(targetId),
      experienceId: booking.experienceId,
      type,
      rating,
      comment,
      isPublic: true
    })

    await newReview.save()

    // 4. Cập nhật rating trung bình
    if (type === 'tourist_to_buddy') {
      // A. Cập nhật Buddy Profile
      const buddyReviews = await ReviewModel.find({
        targetId: booking.buddyId,
        type: 'tourist_to_buddy'
      })
      
      const totalBuddyReviews = buddyReviews.length
      const avgBuddyRating = totalBuddyReviews > 0
        ? buddyReviews.reduce((sum, r) => sum + r.rating, 0) / totalBuddyReviews
        : 0

      await BuddyProfileModel.findOneAndUpdate(
        { userId: booking.buddyId },
        { 
          rating: Number(avgBuddyRating.toFixed(1)), 
          totalReviews: totalBuddyReviews 
        }
      )

      // B. Cập nhật Experience
      const experienceReviews = await ReviewModel.find({
        experienceId: booking.experienceId,
        type: 'tourist_to_buddy'
      })

      const totalExpReviews = experienceReviews.length
      const avgExpRating = totalExpReviews > 0
        ? experienceReviews.reduce((sum, r) => sum + r.rating, 0) / totalExpReviews
        : 0

      await ExperienceModel.findByIdAndUpdate(
        booking.experienceId,
        { avgRating: Number(avgExpRating.toFixed(1)) }
      )
    }

    return newReview
  }

  async getBookingReviews(bookingId: string) {
    const reviews = await ReviewModel.find({ bookingId: new ObjectId(bookingId) })
      .populate({
        path: 'reviewerId',
        select: 'name avatar email'
      })
    return reviews
  }
}

const reviewsService = new ReviewsService()
export default reviewsService
