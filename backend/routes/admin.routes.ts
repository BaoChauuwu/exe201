import { Router } from 'express'
import {
  getPendingEkyc, approveEkyc,
  getPendingPayouts, approvePayout,
  getAllUsers, deleteUser,
  getPendingExperiences, approveExperience,
  getAllBookings, getActiveTracking, resolveSOS
} from '../controllers/admin.controllers'
import { accessTokenValidator, requireRole } from '../middlewares/users.middlewares'
import { wrapRequestHandler } from '../utils/handlers'

const adminRouter = Router()

// All admin routes are protected by 'admin' role
adminRouter.use(accessTokenValidator)
adminRouter.use(requireRole(['admin']))

// eKYC Routes
adminRouter.get('/ekyc/pending', wrapRequestHandler(getPendingEkyc))
adminRouter.post('/ekyc/approve', wrapRequestHandler(approveEkyc))

// Payout Routes
adminRouter.get('/payouts/pending', wrapRequestHandler(getPendingPayouts))
adminRouter.post('/payouts/approve', wrapRequestHandler(approvePayout))

// User Management Routes
adminRouter.get('/users', wrapRequestHandler(getAllUsers))
adminRouter.delete('/users/:id', wrapRequestHandler(deleteUser))

// Experience Management Routes
adminRouter.get('/experiences/pending', wrapRequestHandler(getPendingExperiences))
adminRouter.post('/experiences/approve', wrapRequestHandler(approveExperience))

// Booking / Trip Management Routes
adminRouter.get('/bookings', wrapRequestHandler(getAllBookings))

// Tracking & SOS Routes
adminRouter.get('/tracking', wrapRequestHandler(getActiveTracking))
adminRouter.post('/tracking/resolve-sos', wrapRequestHandler(resolveSOS))

export default adminRouter
