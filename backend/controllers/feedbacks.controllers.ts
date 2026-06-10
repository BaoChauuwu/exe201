import { Request, Response } from 'express'
import httpStatus from '~/constants/httpStatus'
import { TokenPayload } from '~/models/requests/User.requests'
import feedbacksService from '~/services/feedbacks.services'

export const createFeedbackController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { type, rating, content } = req.body

  const feedback = await feedbacksService.createFeedback(user_id, { type, rating, content })

  return res.status(httpStatus.CREATED).json({
    message: 'Gửi đánh giá/góp ý thành công!',
    result: feedback
  })
}

export const getPublicTestimonialsController = async (req: Request, res: Response) => {
  const testimonials = await feedbacksService.getPublicTestimonials()

  return res.status(httpStatus.OK).json({
    message: 'Lấy danh sách đánh giá thành công.',
    result: testimonials
  })
}

export const getAdminFeedbacksController = async (req: Request, res: Response) => {
  const feedbacks = await feedbacksService.getAdminFeedbacks()

  return res.status(httpStatus.OK).json({
    message: 'Lấy danh sách đánh giá/góp ý thành công.',
    result: feedbacks
  })
}

export const updateFeedbackStatusController = async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { status } = req.body

  const feedback = await feedbacksService.updateFeedbackStatus(id, status)

  return res.status(httpStatus.OK).json({
    message: 'Cập nhật trạng thái thành công.',
    result: feedback
  })
}

export const deleteFeedbackController = async (req: Request, res: Response) => {
  const id = req.params.id as string

  await feedbacksService.deleteFeedback(id)

  return res.status(httpStatus.OK).json({
    message: 'Xóa feedback thành công.',
    result: true
  })
}
