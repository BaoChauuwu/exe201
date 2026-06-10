import { ObjectId } from 'mongodb'
import PlatformFeedbackModel from '~/models/PlatformFeedback.model'

class FeedbacksService {
  async createFeedback(userId: string, data: { type: string; rating?: number; content: string }) {
    const feedback = new PlatformFeedbackModel({
      userId: new ObjectId(userId),
      type: data.type,
      rating: data.rating,
      content: data.content,
      status: data.type === 'testimonial' ? 'approved' : 'pending'
    })
    await feedback.save()
    return feedback
  }

  async getPublicTestimonials() {
    return await PlatformFeedbackModel.find({ type: 'testimonial', status: 'approved' })
      .populate({
        path: 'userId',
        select: 'name avatar role'
      })
      .sort({ created_at: -1 })
      .limit(10)
  }

  async getAdminFeedbacks() {
    return await PlatformFeedbackModel.find()
      .populate({
        path: 'userId',
        select: 'name avatar email role'
      })
      .sort({ created_at: -1 })
  }

  async updateFeedbackStatus(feedbackId: string, status: string) {
    const feedback = await PlatformFeedbackModel.findByIdAndUpdate(
      feedbackId,
      { status },
      { new: true }
    )
    if (!feedback) {
      throw new Error('Không tìm thấy feedback')
    }
    return feedback
  }

  async deleteFeedback(feedbackId: string) {
    const feedback = await PlatformFeedbackModel.findByIdAndDelete(feedbackId)
    if (!feedback) {
      throw new Error('Không tìm thấy feedback')
    }
    return feedback
  }
}

const feedbacksService = new FeedbacksService()
export default feedbacksService
