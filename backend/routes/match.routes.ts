import { Router } from 'express'
import { getSmartMatches } from '../controllers/match.controllers'
import { wrapRequestHandler } from '../utils/handlers'

const matchRouter = Router()

// Public matching / recommendation quiz endpoint
matchRouter.post('/', wrapRequestHandler(getSmartMatches))

export default matchRouter
