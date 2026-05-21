import express from 'express'
import cors from 'cors'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import './middlewares/passport.middleware'
import passport from 'passport'

const app = express()
const port = 3000
databaseService.connect().then(() => {
  console.log('Connected to database')
}).catch((err) => {
  console.error('Failed to connect to database', err)
  process.exit(1)
})

// Middleware phải đăng ký TRƯỚC route
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(passport.initialize())

// Routes
app.use('/users', usersRouter)

app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

