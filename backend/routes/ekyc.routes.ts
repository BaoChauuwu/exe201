import { Router } from 'express'
import { submitEkyc } from '../controllers/ekyc.controllers'
import { accessTokenValidator } from '../middlewares/users.middlewares'
import { wrapRequestHandler } from '../utils/handlers'

const ekycRouter = Router()

ekycRouter.post('/submit', accessTokenValidator, wrapRequestHandler(submitEkyc))

export default ekycRouter
