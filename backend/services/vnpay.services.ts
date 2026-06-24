import { config } from 'dotenv'
import BookingModel from '../models/Booking.model'
import TransactionModel from '../models/Transaction.model'
import AvailabilitySlotModel from '../models/AvailabilitySlot.model'
import BuddyProfileModel from '../models/BuddyProfile.model'
import { sortObject, formatVnpDate, createVnpSignature } from '../utils/vnpay.utils'
import UserModel from '../models/User.model'
import ExperienceModel from '../models/Experience.model'
import emailService from './emailService'
config()

// -----------------------------------------------------------------------
// Đọc config từ .env một lần khi module load
// -----------------------------------------------------------------------
const VNP_TMN_CODE = process.env.vnp_TmnCode as string
const VNP_HASH_SECRET = process.env.vnp_HashSecret as string
const VNP_URL = process.env.vnp_Url as string
const VNP_RETURN_URL = process.env.vnp_ReturnUrl as string

// -----------------------------------------------------------------------
// Interface định nghĩa payload gửi lên từ Frontend
// -----------------------------------------------------------------------
export interface CreatePaymentUrlParams {
  bookingId: string       // Mã booking trong DB (_id dạng string)
  amount: number          // Số tiền (VND, chưa nhân 100)
  orderDescription: string
  ipAddr: string
  bankCode?: string       // Tuỳ chọn: nếu muốn chọn trước ngân hàng
  locale?: string         // Mặc định 'vn'
  returnUrl?: string      // Mặc định sẽ dùng VNP_RETURN_URL trong env nếu không truyền
}

// -----------------------------------------------------------------------
// SERVICE
// -----------------------------------------------------------------------
class VnpayService {

  /**
   * Tạo Payment URL để redirect người dùng sang cổng VNPAY.
   * bookingId được dùng làm vnp_TxnRef (mã đơn hàng duy nhất).
   */
  createPaymentUrl(params: CreatePaymentUrlParams): string {
    const {
      bookingId,
      amount,
      orderDescription,
      ipAddr,
      bankCode,
      locale = 'vn'
    } = params

    const createDate = formatVnpDate(new Date())

    // Khởi tạo object các tham số VNPAY
    const vnpParams: Record<string, any> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: VNP_TMN_CODE,
      vnp_Amount: amount * 100,           // VNPAY yêu cầu nhân 100
      vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND',
      vnp_IpAddr: ipAddr,
      vnp_Locale: locale,
      vnp_OrderInfo: orderDescription,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: params.returnUrl || VNP_RETURN_URL,
      vnp_TxnRef: bookingId               // Dùng bookingId làm mã đơn hàng
    }

    // Thêm bankCode nếu người dùng đã chọn sẵn
    if (bankCode && bankCode.trim() !== '') {
      vnpParams['vnp_BankCode'] = bankCode
    }

    // Sắp xếp và mã hoá URL theo chuẩn VNPAY (bắt buộc trước khi tạo chữ ký)
    const sortedParams = sortObject(vnpParams)

    // Tạo chữ ký HMAC SHA512
    const secureHash = createVnpSignature(sortedParams, VNP_HASH_SECRET)

    // Gắn chữ ký vào params (KHÔNG sort lại sau bước này)
    sortedParams['vnp_SecureHash'] = secureHash

    // Build query string và nối vào VNP_URL
    const queryString = Object.entries(sortedParams)
      .map(([k, v]) => `${k}=${v}`)
      .join('&')

    return `${VNP_URL}?${queryString}`
  }

  // -----------------------------------------------------------------------
  // Xử lý IPN (Webhook từ VNPAY gọi ngầm về server)
  // -----------------------------------------------------------------------

  /**
   * Xác minh chữ ký từ VNPAY IPN request.
   * Trả về true nếu chữ ký hợp lệ.
   */
  verifyIpnSignature(query: Record<string, any>): boolean {
    // Tách chữ ký ra khỏi object để tạo lại và so sánh
    const receivedHash = query['vnp_SecureHash']

    const verifyParams: Record<string, any> = {}
    for (const key in query) {
      if (key.startsWith('vnp_')) {
        verifyParams[key] = query[key]
      }
    }
    delete verifyParams['vnp_SecureHash']
    delete verifyParams['vnp_SecureHashType']

    const sortedParams = sortObject(verifyParams)
    const calculatedHash = createVnpSignature(sortedParams, VNP_HASH_SECRET)

    return calculatedHash === receivedHash
  }

  /**
   * Xử lý toàn bộ nghiệp vụ sau khi IPN được gọi.
   * Trả về object { RspCode, Message } để gửi ngược lại cho VNPAY.
   * 
   * Nguyên tắc Lũy đẳng (Idempotency):
   *   - VNPAY có thể gọi IPN nhiều lần cho cùng 1 đơn hàng.
   *   - Ta phải kiểm tra trạng thái đơn hàng trước khi cập nhật để tránh xử lý trùng.
   */
  async processIpn(query: Record<string, any>): Promise<{ RspCode: string; Message: string }> {
    // Bước 1: Xác minh chữ ký (quan trọng nhất - bảo vệ khỏi giả mạo)
    if (!this.verifyIpnSignature(query)) {
      return { RspCode: '97', Message: 'Fail checksum' }
    }

    const vnpTxnRef = query['vnp_TxnRef'] as string           // = bookingId
    const vnpAmount = parseInt(query['vnp_Amount'] as string)  // Đã nhân 100
    const vnpResponseCode = query['vnp_ResponseCode'] as string
    const vnpTransactionStatus = query['vnp_TransactionStatus'] as string
    const vnpTransactionNo = query['vnp_TransactionNo'] as string // Mã GD phía VNPAY

    // Bước 2: Tìm đơn hàng trong DB
    const booking = await BookingModel.findById(vnpTxnRef)
    if (!booking) {
      return { RspCode: '01', Message: 'Order not found' }
    }

    // Bước 3: Kiểm tra số tiền khớp (bảo vệ khỏi tấn công thay đổi amount)
    const expectedAmount = booking.totalPrice * 100
    if (vnpAmount !== expectedAmount) {
      return { RspCode: '04', Message: 'Invalid amount' }
    }

    // Bước 4: Kiểm tra lũy đẳng - đơn hàng đã được xử lý trước đó chưa?
    // paymentStatus 'paid' hoặc 'failed' nghĩa là IPN đã chạy rồi
    if (booking.paymentStatus === 'paid' || booking.paymentStatus === 'failed') {
      return { RspCode: '02', Message: 'Order already confirmed' }
    }

    // Bước 5: Xử lý nghiệp vụ theo kết quả giao dịch
    if (vnpResponseCode === '00' && (!vnpTransactionStatus || vnpTransactionStatus === '00')) {
      // ✅ Thanh toán THÀNH CÔNG
      booking.paymentStatus = 'paid'
      booking.status = 'confirmed'
      booking.paymentMethod = 'VNPay'
      await booking.save()

      // Ghi nhận tiền vào pendingBalance của Buddy
      const buddyProfile = await BuddyProfileModel.findOne({ userId: booking.buddyId })
      if (buddyProfile) {
        buddyProfile.pendingBalance = (buddyProfile.pendingBalance || 0) + booking.buddyEarning
        await buddyProfile.save()
      }

      // Tạo bản ghi Transaction để lưu vết
      await TransactionModel.create({
        bookingId: booking._id,
        payerId: booking.touristId,
        type: 'payment',
        amount: booking.totalPrice,
        paymentMethod: 'VNPay',
        gatewayTransactionId: vnpTransactionNo || `VNP-${vnpTxnRef}`,
        status: 'success'
      })

      // Khoá lịch Buddy (tạo AvailabilitySlot)
      const [startHour, startMin] = booking.startTime.split(':').map(Number)
      const endTotalMin = startHour * 60 + startMin + booking.hours * 60
      const endHour = Math.floor(endTotalMin / 60)
      const endMin = endTotalMin % 60
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`

      await AvailabilitySlotModel.create({
        buddyId: booking.buddyId,
        date: booking.scheduledDate,
        startTime: booking.startTime,
        endTime,
        status: 'booked',
        bookingId: booking._id
      })

      // Gửi email xác nhận (Bất đồng bộ - Không dùng await để tránh block luồng phản hồi VNPAY)
      ;(async () => {
        try {
          const [tourist, buddy, experience] = await Promise.all([
            UserModel.findById(booking.touristId),
            UserModel.findById(booking.buddyId),
            ExperienceModel.findById(booking.experienceId)
          ])

          if (tourist && buddy && experience) {
            // Gửi email cho Tourist
            emailService.sendTouristConfirmation(
              tourist.email,
              booking,
              {
                name: buddy.name,
                email: buddy.email,
                avatar: buddy.avatar,
                phone: buddy.phone
              },
              experience.title
            )

            // Gửi email cho Buddy
            emailService.sendBuddyNotification(
              buddy.email,
              booking,
              {
                name: tourist.name,
                email: tourist.email,
                avatar: tourist.avatar,
                phone: tourist.phone
              },
              experience.title
            )
          }
        } catch (mailErr) {
          console.error('[VnpayService] Lỗi khi lấy thông tin gửi email:', mailErr)
        }
      })()

    } else {
      // ❌ Thanh toán THẤT BẠI hoặc bị hủy
      booking.paymentStatus = 'failed'
      // Giữ nguyên status 'pending' để tourist có thể thử lại
      await booking.save()

      // Ghi nhận Transaction thất bại để audit
      await TransactionModel.create({
        bookingId: booking._id,
        payerId: booking.touristId,
        type: 'payment',
        amount: booking.totalPrice,
        paymentMethod: 'VNPay',
        gatewayTransactionId: vnpTransactionNo || `VNP-FAIL-${vnpTxnRef}`,
        status: 'failed'
      })
    }

    // Bước 6: Trả về success cho VNPAY để VNPAY không gọi lại IPN nữa
    return { RspCode: '00', Message: 'Confirm Success' }
  }
}

const vnpayService = new VnpayService()
export default vnpayService
