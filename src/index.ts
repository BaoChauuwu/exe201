import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'

const app = express()
const port = 3000
databaseService.connect().then(() => {
  console.log('Connected to database')
}).catch((err) => {
  console.error('Failed to connect to database', err)
  process.exit(1)
})
// Middleware phải đăng ký TRƯỚC route
app.use(express.json())

// Routes
app.use('/users', usersRouter)

app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
