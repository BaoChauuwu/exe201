import axiosInstance from './axios'

export interface CreatePaymentUrlPayload {
  bookingId: string
  orderDescription?: string
  bankCode?: string
}

export interface CreatePaymentUrlResponse {
  code: number
  message: string
  data: {
    paymentUrl: string
  }
}

export interface VnpayReturnResponse {
  code: number
  message: string
  data: {
    vnpResponseCode: string
    bookingId: string
    paymentStatus: string
    bookingStatus: string
  }
}

export const vnpayApi = {
  /**
   * Tạo URL thanh toán VNPAY, redirect người dùng đến cổng VNPAY.
   * Backend lấy amount từ DB theo bookingId — không truyền amount từ client.
   */
  createPaymentUrl: (payload: CreatePaymentUrlPayload) =>
    axiosInstance.post<CreatePaymentUrlResponse>('/payment/create-url', payload),

  /**
   * Lấy kết quả thanh toán từ Backend sau khi VNPAY redirect về.
   * Trạng thái thực sự đến từ DB (được IPN cập nhật), không phải URL params.
   */
  getReturnResult: (queryParams: Record<string, string>) =>
    axiosInstance.get<VnpayReturnResponse>('/payment/vnpay-return', {
      params: queryParams
    })
}
