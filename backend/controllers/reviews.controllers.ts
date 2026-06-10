import { Request, Response } from 'express'
import httpStatus from '~/constants/httpStatus'
import { TokenPayload } from '~/models/requests/User.requests'
import reviewsService from '~/services/reviews.services'

export const createReviewController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { bookingId, rating, comment } = req.body

  const review = await reviewsService.createReview({
    bookingId,
    reviewerId: user_id,
    rating,
    comment
  })

  return res.status(httpStatus.CREATED).json({
    message: 'Gửi đánh giá thành công!',
    result: review
  })
}

export const getBookingReviewsController = async (req: Request, res: Response) => {
  const { bookingId } = req.params
  const reviews = await reviewsService.getBookingReviews(bookingId as string)

  return res.status(httpStatus.OK).json({
    message: 'Lấy danh sách đánh giá thành công.',
    result: reviews
  })
}

export const getTargetReviewsController = async (req: Request, res: Response) => {
  const { targetId } = req.params
  const reviews = await reviewsService.getTargetReviews(targetId as string)

  return res.status(httpStatus.OK).json({
    message: 'Lấy danh sách đánh giá thành công.',
    result: reviews
  })
}
