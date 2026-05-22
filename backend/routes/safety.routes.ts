import { Router } from 'express'
import { updateLocation, triggerSOS } from '../controllers/safety.controllers'

const safetyRouter = Router()

safetyRouter.post('/tracking', updateLocation)
safetyRouter.post('/sos', triggerSOS)

export default safetyRouter
