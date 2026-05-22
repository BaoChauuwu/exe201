import { Router } from 'express'
import { requestPayout } from '../controllers/payouts.controllers'

const payoutsRouter = Router()

payoutsRouter.post('/request', requestPayout)

export default payoutsRouter
