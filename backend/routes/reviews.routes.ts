import { Router } from 'express'
import { createReviewController, getBookingReviewsController, getTargetReviewsController } from '~/controllers/reviews.controllers'
import { createReviewValidator } from '~/middlewares/reviews.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const reviewsRouter = Router()

// 1. Gửi đánh giá cho chuyến đi (yêu cầu đăng nhập)
reviewsRouter.post(
  '/',
  accessTokenValidator,
  createReviewValidator,
  wrapRequestHandler(createReviewController)
)

// 2. Lấy danh sách đánh giá của một booking (Công khai / Public)
reviewsRouter.get(
  '/booking/:bookingId',
  wrapRequestHandler(getBookingReviewsController)
)

// 3. Lấy danh sách đánh giá của một target (buddy hoặc tourist - Công khai / Public)
reviewsRouter.get(
  '/target/:targetId',
  wrapRequestHandler(getTargetReviewsController)
)

export default reviewsRouter
