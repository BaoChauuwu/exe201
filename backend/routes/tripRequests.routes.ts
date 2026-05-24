import { Router } from 'express'
import {
  createTripRequest,
  getAllOpenRequests,
  getMyTripRequests,
  getTripRequestById
} from '../controllers/tripRequests.controllers'
import { accessTokenValidator, requireRole } from '../middlewares/users.middlewares'
import { wrapRequestHandler } from '../utils/handlers'

const tripRequestsRouter = Router()

// Tourist: Create a trip request
tripRequestsRouter.post(
  '/',
  accessTokenValidator,
  requireRole(['tourist']),
  wrapRequestHandler(createTripRequest)
)

// Tourist: Get their own trip requests
tripRequestsRouter.get(
  '/my',
  accessTokenValidator,
  requireRole(['tourist']),
  wrapRequestHandler(getMyTripRequests)
)

// Buddy: Get all open trip requests
tripRequestsRouter.get(
  '/open',
  accessTokenValidator,
  requireRole(['buddy']),
  wrapRequestHandler(getAllOpenRequests)
)

// Any authenticated user: Get details of a trip request
tripRequestsRouter.get(
  '/:id',
  accessTokenValidator,
  wrapRequestHandler(getTripRequestById)
)

export default tripRequestsRouter
