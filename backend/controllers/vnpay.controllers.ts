import { Request, Response } from 'express'
import httpStatus from '../constants/httpStatus'
import { TokenPayload } from '../models/requests/User.requests'
import BookingModel from '../models/Booking.model'
import vnpayService from '../services/vnpay.services'
import { getClientIp } from '../utils/vnpay.utils'

// -----------------------------------------------------------------------
// API 1: Tạo URL thanh toán VNPAY
// POST /payment/create-url
// Validation đã được xử lý hoàn toàn bởi createPaymentUrlValidator
// -----------------------------------------------------------------------
export const createPaymentUrlController = async (req: Request, res: Response) => {
  // booking đã được middleware đính kèm vào req, không cần query DB lại
  const booking = (req as any).booking
  const { orderDescription, bankCode } = req.body
  const ipAddr = getClientIp(req as any)

  const paymentUrl = vnpayService.createPaymentUrl({
    bookingId: booking._id.toString(),
    amount: booking.totalPrice,
    orderDescription: orderDescription || `Thanh toán tour ${booking.bookingCode}`,
    ipAddr,
    bankCode
  })

  return res.status(httpStatus.OK).json({
    code: 200,
    message: 'Success',
    data: { paymentUrl }
  })
}

// -----------------------------------------------------------------------
// API 2: IPN Webhook - VNPAY gọi ngầm về server để xác nhận giao dịch
// GET /payment/vnpay-ipn
//
// ⚠️  Endpoint này KHÔNG yêu cầu accessToken (VNPAY server gọi trực tiếp)
// ⚠️  Phải luôn trả về HTTP 200, chỉ phân biệt kết quả qua RspCode trong body
// ⚠️  Đây là nguồn sự thật duy nhất để cập nhật DB, KHÔNG dùng Return URL
// -----------------------------------------------------------------------
export const vnpayIpnController = async (req: Request, res: Response) => {
  const query = req.query as Record<string, any>
  const result = await vnpayService.processIpn(query)
  return res.status(httpStatus.OK).json(result)
}

// -----------------------------------------------------------------------
// API 3: Return URL - Trang kết quả sau khi VNPAY redirect người dùng về
// GET /payment/vnpay-return
//
// Lưu ý: Chỉ dùng để Frontend hiển thị kết quả tạm thời.
// Trạng thái thực sự của booking luôn lấy từ DB (đã được IPN cập nhật).
// -----------------------------------------------------------------------
export const vnpayReturnController = async (req: Request, res: Response) => {
  const query = req.query as Record<string, any>
  const vnpResponseCode = query['vnp_ResponseCode']
  const vnpTxnRef = query['vnp_TxnRef'] as string // = bookingId

  // Gọi processIpn để cập nhật trạng thái đơn hàng trong DB và tạo giao dịch (cần thiết cho local dev khi IPN không gọi được)
  const ipnResult = await vnpayService.processIpn(query)
  if (ipnResult.RspCode === '97') {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Chữ ký không hợp lệ.'
    })
  }

  // Lấy trạng thái booking từ DB sau khi đã xử lý cập nhật ở trên
  const booking = await BookingModel.findById(vnpTxnRef)

  return res.status(httpStatus.OK).json({
    code: vnpResponseCode === '00' ? 200 : 400,
    message: vnpResponseCode === '00' ? 'Thanh toán thành công.' : 'Thanh toán thất bại hoặc bị hủy.',
    data: {
      vnpResponseCode,
      bookingId: vnpTxnRef,
      paymentStatus: booking?.paymentStatus ?? 'unknown',
      bookingStatus: booking?.status ?? 'unknown'
    }
  })
}
