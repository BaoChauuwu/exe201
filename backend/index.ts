import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { initSocket } from './socket'
import usersRouter from './routes/users.routes'
import messagesRouter from './routes/messages.routes'
import safetyRouter from './routes/safety.routes'
import payoutsRouter from './routes/payouts.routes'
import ekycRouter from './routes/ekyc.routes'
import buddyProfilesRouter from './routes/buddyProfiles.routes'
import adminRouter from './routes/admin.routes'
import experiencesRouter from './routes/experiences.routes'
import tripRequestsRouter from './routes/tripRequests.routes'
import biddingsRouter from './routes/biddings.routes'
import categoriesRouter from './routes/categories.routes'
import bookingsRouter from './routes/bookings.routes'
import vnpayRouter from './routes/vnpay.routes'
import reviewsRouter from './routes/reviews.routes'
import databaseService from './services/database.services'
import categoriesService from './services/categories.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import './middlewares/passport.middleware'
import passport from 'passport'

const app = express()
const port = process.env.PORT || 3000
databaseService.connect().then(async () => {
  console.log('Connected to database')
  await categoriesService.seedCategories()
}).catch((err) => {
  console.error('Failed to connect to database', err)
  process.exit(1)
})

// Middleware phải đăng ký TRƯỚC route
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(passport.initialize())

// Routes
app.use('/users', usersRouter)
app.use('/messages', messagesRouter)
app.use('/safety', safetyRouter)
app.use('/payouts', payoutsRouter)
app.use('/ekyc', ekycRouter)
app.use('/buddy-profile', buddyProfilesRouter)
app.use('/admin', adminRouter)
app.use('/experiences', experiencesRouter)
app.use('/trip-requests', tripRequestsRouter)
app.use('/biddings', biddingsRouter)
app.use('/categories', categoriesRouter)
app.use('/bookings', bookingsRouter)
app.use('/payment', vnpayRouter)
app.use('/reviews', reviewsRouter)

app.use(defaultErrorHandler)

const httpServer = createServer(app)
initSocket(httpServer)

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
