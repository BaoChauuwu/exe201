import axiosInstance from './axios'

export interface IBidding {
  _id: string
  tripRequestId: string
  buddyId: any
  offerPrice: number
  proposal: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export interface BiddingFormValues {
  tripRequestId: string
  offerPrice: number
  proposal: string
}

export const biddingApi = {
  create: (data: BiddingFormValues, cfg?: any) =>
    axiosInstance.post<{ message: string; result: IBidding }>('/biddings', data, cfg),

  accept: (biddingId: string, cfg?: any) =>
    axiosInstance.post<{ message: string; result: IBidding }>(`/biddings/${biddingId}/accept`, {}, cfg)
}
