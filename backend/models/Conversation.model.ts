import mongoose from 'mongoose'
import { conversationSchema, IConversation } from './schemas/Conversation.schema'

const ConversationModel = mongoose.model<IConversation>('Conversations', conversationSchema)
export default ConversationModel
