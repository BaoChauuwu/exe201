import { Router } from 'express'
import { requestPayout, depositWallet } from '../controllers/payouts.controllers'

const payoutsRouter = Router()

payoutsRouter.post('/request', requestPayout)
payoutsRouter.post('/deposit', depositWallet)

export default payoutsRouter
