import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { messageSchema, IMessage } from '../models/schemas/Message.schema'
import { conversationSchema, IConversation } from '../models/schemas/Conversation.schema'
import { ObjectId } from 'mongodb'
import { TokenPayload } from '../models/requests/User.requests'

// Check if models exist, otherwise compile them
const Message = mongoose.models.Messages || mongoose.model<IMessage>('Messages', messageSchema)
const Conversation = mongoose.models.Conversations || mongoose.model<IConversation>('Conversations', conversationSchema)

export const getMessagesByReceiverId = async (req: Request, res: Response) => {
    const { receiverId } = req.params
    const senderId = (req as any).decoded_authorization.user_id

    try {
        let conversation = await Conversation.findOne({
            participants: { $all: [new ObjectId(senderId), new ObjectId(receiverId)] }
        })
        
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [new ObjectId(senderId), new ObjectId(receiverId)]
            })
        }

        const messages = await Message.find({ conversationId: conversation._id }).sort({ created_at: 1 })
        
        res.json({
            message: 'Get messages successfully',
            data: messages
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error })
    }
}

export const sendMessage = async (req: Request, res: Response) => {
    const { receiverId } = req.params
    const senderId = (req as any).decoded_authorization.user_id
    const { content } = req.body

    try {
        let conversation = await Conversation.findOne({
            participants: { $all: [new ObjectId(senderId), new ObjectId(receiverId)] }
        })
        
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [new ObjectId(senderId), new ObjectId(receiverId)]
            })
        }

        const newMessage = await Message.create({
            conversationId: conversation._id,
            senderId: new ObjectId(senderId),
            content,
            type: 'text'
        })

        // Update conversation lastMessage
        conversation.lastMessage = content
        await conversation.save()

        res.json({
            message: 'Send message successfully',
            data: newMessage
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error })
    }
}

export const getConversations = async (req: Request, res: Response) => {
    const userId = (req as any).decoded_authorization.user_id

    try {
        const conversations = await Conversation.find({
            participants: new ObjectId(userId)
        }).populate('participants', 'name avatar email role').sort({ updated_at: -1 })

        res.json({
            message: 'Get conversations successfully',
            data: conversations
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error })
    }
}
