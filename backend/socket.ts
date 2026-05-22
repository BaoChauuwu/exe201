import { Server as SocketIOServer } from 'socket.io'
import { Server as HttpServer } from 'http'

let io: SocketIOServer
const onlineUsers = new Map<string, string>()

export const initSocket = (httpServer: HttpServer) => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true
        }
    })

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        // Register user to their own room to receive private messages
        socket.on('register_user', (userId: string) => {
            onlineUsers.set(socket.id, userId)
            socket.join(userId)
            io.emit('user_online', userId)
            console.log(`User ${userId} joined room.`)
        })

        // Check online status
        socket.on('check_online', (targetId: string) => {
            const isOnline = Array.from(onlineUsers.values()).includes(targetId)
            socket.emit('online_status', { userId: targetId, isOnline })
        })

        // Chat event
        socket.on('send_message', (data: { receiverId: string, message: any }) => {
            io.to(data.receiverId).emit('receive_message', data.message)
        })

        // Admin room for SOS
        socket.on('join_admin', () => {
            socket.join('admin_room')
        })

        socket.on('disconnect', () => {
            const userId = onlineUsers.get(socket.id)
            if (userId) {
                io.emit('user_offline', userId)
                onlineUsers.delete(socket.id)
            }
            console.log('User disconnected:', socket.id)
        })
    })

    return io
}

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!')
    }
    return io
}
