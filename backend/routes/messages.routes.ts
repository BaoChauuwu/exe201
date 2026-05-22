import { Router } from 'express'
import { getMessagesByReceiverId, sendMessage, getConversations } from '../controllers/messages.controllers'
import { accessTokenValidator } from '../middlewares/users.middlewares'
import { wrapRequestHandler } from '../utils/handlers'

const messagesRouter = Router()

messagesRouter.get('/conversations', accessTokenValidator, wrapRequestHandler(getConversations))
messagesRouter.get('/user/:receiverId', accessTokenValidator, wrapRequestHandler(getMessagesByReceiverId))
messagesRouter.post('/user/:receiverId', accessTokenValidator, wrapRequestHandler(sendMessage))

export default messagesRouter
