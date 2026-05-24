import { Router } from 'express'
import {
  createBidding,
  acceptBidding
} from '../controllers/biddings.controllers'
import { accessTokenValidator, requireRole } from '../middlewares/users.middlewares'
import { wrapRequestHandler } from '../utils/handlers'

const biddingsRouter = Router()

// Buddy: Create a bidding
biddingsRouter.post(
  '/',
  accessTokenValidator,
  requireRole(['buddy']),
  wrapRequestHandler(createBidding)
)

// Tourist: Accept a bidding
biddingsRouter.post(
  '/:biddingId/accept',
  accessTokenValidator,
  requireRole(['tourist']),
  wrapRequestHandler(acceptBidding)
)

export default biddingsRouter
