import { Router } from 'express'
import {
  createPaymentUrlController,
  vnpayIpnController,
  vnpayReturnController
} from '../controllers/vnpay.controllers'
import { accessTokenValidator, requireRole } from '../middlewares/users.middlewares'
import { createPaymentUrlValidator } from '../middlewares/vnpay.middlewares'
import { wrapRequestHandler } from '../utils/handlers'

const vnpayRouter = Router()

// POST /payment/create-url
// Chỉ Tourist đã đăng nhập mới được tạo link thanh toán cho booking của mình
vnpayRouter.post(
  '/create-url',
  accessTokenValidator,
  requireRole(['tourist']),
  createPaymentUrlValidator,
  wrapRequestHandler(createPaymentUrlController)
)

// GET /payment/vnpay-return
// Browser redirect từ VNPAY sau khi user thanh toán xong
// Yêu cầu đăng nhập vì chỉ tourist đang đăng nhập mới được xem kết quả booking của mình
vnpayRouter.get(
  '/vnpay-return',
  accessTokenValidator,
  requireRole(['tourist']),
  wrapRequestHandler(vnpayReturnController)
)

// GET /payment/vnpay-ipn
// ⚠️ KHÔNG có accessTokenValidator - đây là VNPAY SERVER gọi ngầm vào backend
// VNPAY machine-to-machine call, không có user session hay JWT token
// Bảo mật thay thế: xác minh chữ ký HMAC-SHA512 (vnp_SecureHash) bên trong service
vnpayRouter.get(
  '/vnpay-ipn',
  wrapRequestHandler(vnpayIpnController)
)

export default vnpayRouter
