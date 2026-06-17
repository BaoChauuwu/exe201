import { Router } from 'express'
import { updateLocation, triggerSOS, resolveSOS, getActiveSOS } from '../controllers/safety.controllers'

const safetyRouter = Router()

// Admin lấy danh sách SOS
safetyRouter.get('/sos/admin', getActiveSOS)

// Cập nhật vị trí GPS (Tourist & Buddy)
safetyRouter.post('/tracking', updateLocation)

// Tourist hoặc Buddy gửi SOS
safetyRouter.post('/sos', triggerSOS)

// Admin xác nhận đã xử lý xong SOS
safetyRouter.post('/sos/:bookingId/resolve', resolveSOS)

export default safetyRouter
