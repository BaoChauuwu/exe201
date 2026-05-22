import { Router } from 'express'
import { getPendingEkyc, approveEkyc, getPendingPayouts, approvePayout, getAllUsers, deleteUser } from '../controllers/admin.controllers'
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

export default adminRouter
