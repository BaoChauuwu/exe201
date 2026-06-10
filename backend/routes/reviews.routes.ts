import { Router } from 'express'
import { createReviewController, getBookingReviewsController, getTargetReviewsController } from '~/controllers/reviews.controllers'
import { createReviewValidator } from '~/middlewares/reviews.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const reviewsRouter = Router()

// Yêu cầu đăng nhập cho tất cả các API đánh giá
reviewsRouter.use(accessTokenValidator)

// 1. Gửi đánh giá cho chuyến đi
reviewsRouter.post(
  '/',
  createReviewValidator,
  wrapRequestHandler(createReviewController)
)

// 2. Lấy danh sách đánh giá của một booking
reviewsRouter.get(
  '/booking/:bookingId',
  wrapRequestHandler(getBookingReviewsController)
)

// 3. Lấy danh sách đánh giá của một target (buddy hoặc tourist)
reviewsRouter.get(
  '/target/:targetId',
  wrapRequestHandler(getTargetReviewsController)
)

export default reviewsRouter
