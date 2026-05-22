import mongoose from 'mongoose'
import { messageSchema, IMessage } from './schemas/Message.schema'

const MessageModel = mongoose.model<IMessage>('Messages', messageSchema)
export default MessageModel
