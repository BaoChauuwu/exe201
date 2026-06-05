import axiosInstance from './axios'

export interface IReview {
    _id: string
    bookingId: string
    reviewerId: {
        _id: string
        name: string
        avatar?: string
    }
    targetId: string
    experienceId: string
    type: 'tourist_to_buddy' | 'buddy_to_tourist'
    rating: number
    comment?: string
    isPublic: boolean
    created_at?: string
    updated_at?: string
}

export const reviewApi = {
    createReview: (data: { bookingId: string; rating: number; comment?: string }) =>
        axiosInstance.post<{ message: string; result: IReview }>('/reviews', data),

    getBookingReviews: (bookingId: string) =>
        axiosInstance.get<{ message: string; result: IReview[] }>(`/reviews/booking/${bookingId}`)
}
