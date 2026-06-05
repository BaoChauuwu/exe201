import axiosInstance from './axios'

export interface IBooking {
    _id: string
    bookingCode: string
    touristId: {
        _id: string
        name: string
        avatar?: string
        email: string
        phone?: string
    }
    buddyId: {
        _id: string
        name: string
        avatar?: string
        email: string
        phone?: string
    }
    experienceId: {
        _id: string
        title: string
        images?: string[]
        price: number
        currency?: string
    }
    scheduledDate: string
    startTime: string
    hours: number
    groupSize: number
    pricePerHourSnapshot: number
    currency: string
    totalPrice: number
    commissionAmount: number
    buddyEarning: number
    paymentStatus: 'paid' | 'unpaid'
    paymentMethod?: string
    status: 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled'
    cancelReason?: string
    meetingPoint?: {
        type: string
        coordinates: number[]
    }
    refundBankInfo?: {
        bankCode: string
        accountNumber: string
        accountName: string
    }
    created_at: string
    updated_at: string
}

export interface CreateBookingData {
    experienceId: string
    scheduledDate: string // YYYY-MM-DD
    startTime: string // HH:MM
    hours: number
    groupSize: number
    refundBankInfo?: {
        bankCode: string
        accountNumber: string
        accountName: string
    }
}

export const bookingApi = {
    /**
     * Tạo một đặt lịch mới (Tourist)
     */
    create: (data: CreateBookingData) =>
        axiosInstance.post<{ message: string; result: IBooking }>('/bookings', data),

    /**
     * Lấy danh sách đặt lịch của cá nhân (Tourist hoặc Buddy)
     */
    getMyBookings: () =>
        axiosInstance.get<{ message: string; result: IBooking[] }>('/bookings/my'),

    /**
     * Lấy chi tiết đặt lịch
     */
    getById: (id: string) =>
        axiosInstance.get<{ message: string; result: IBooking }>(`/bookings/${id}`),

    /**
     * Thanh toán đặt lịch giả lập
     */
    pay: (id: string, paymentMethod: string) =>
        axiosInstance.post<{ message: string; result: IBooking }>(`/bookings/${id}/pay`, { paymentMethod }),

    /**
     * Thanh toán bằng ví điện tử UniTravel
     */
    payWithWallet: (id: string) =>
        axiosInstance.post<{ message: string; result: IBooking }>(`/bookings/${id}/pay-with-wallet`),

    /**
     * Buddy hoặc Admin xác nhận hoàn thành tour (giải ngân)
     */
    complete: (id: string) =>
        axiosInstance.post<{ message: string; result: IBooking }>(`/bookings/${id}/complete`),

    /**
     * Hủy lịch trình đặt tour (Tourist, Buddy hoặc Admin)
     */
    cancel: (id: string, cancelReason: string) =>
        axiosInstance.post<{ message: string; result: IBooking }>(`/bookings/${id}/cancel`, { cancelReason }),

    /**
     * Lấy danh sách chuyến đi đã thanh toán thành công của Tourist
     */
    getTouristBookings: (touristId: string) =>
        axiosInstance.get<{ message: string; result: IBooking[] }>(`/bookings/tourist/${touristId}`),

    /**
     * Lấy danh sách chuyến đi đã thanh toán thành công của Buddy
     */
    getBuddyBookings: (buddyId: string) =>
        axiosInstance.get<{ message: string; result: IBooking[] }>(`/bookings/buddy/${buddyId}`)
}
