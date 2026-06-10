import { Router } from 'express'
import {
  createFeedbackController,
  getPublicTestimonialsController,
  getAdminFeedbacksController,
  updateFeedbackStatusController,
  deleteFeedbackController
} from '~/controllers/feedbacks.controllers'
import { accessTokenValidator, requireRole } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const feedbacksRouter = Router()

// Public
feedbacksRouter.get(
  '/public',
  wrapRequestHandler(getPublicTestimonialsController)
)

// Yêu cầu đăng nhập để gửi feedback
feedbacksRouter.post(
  '/',
  accessTokenValidator,
  wrapRequestHandler(createFeedbackController)
)

// Admin
feedbacksRouter.get(
  '/admin',
  accessTokenValidator,
  requireRole(['admin']),
  wrapRequestHandler(getAdminFeedbacksController)
)

feedbacksRouter.patch(
  '/admin/:id/status',
  accessTokenValidator,
  requireRole(['admin']),
  wrapRequestHandler(updateFeedbackStatusController)
)

feedbacksRouter.delete(
  '/admin/:id',
  accessTokenValidator,
  requireRole(['admin']),
  wrapRequestHandler(deleteFeedbackController)
)

export default feedbacksRouter
