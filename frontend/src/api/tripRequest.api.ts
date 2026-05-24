import axiosInstance from './axios'

export interface ITripRequest {
  _id: string
  touristId: any
  title: string
  description: string
  date: string
  time: string
  durationHours: number
  budget: number
  city: string
  meetingPoint: {
    type: 'Point'
    coordinates: [number, number]
  }
  status: 'open' | 'assigned' | 'completed' | 'cancelled'
  selectedBiddingId?: string
  created_at: string
  updated_at: string
}

export interface TripRequestFormValues {
  title: string
  description: string
  date: string
  time: string
  durationHours: number
  budget: number
  city: string
  meetingPointLng: number
  meetingPointLat: number
}

export const tripRequestApi = {
  create: (data: TripRequestFormValues, cfg?: any) =>
    axiosInstance.post<{ message: string; result: ITripRequest }>('/trip-requests', data, cfg),

  getMyRequests: (cfg?: any) =>
    axiosInstance.get<{ message: string; result: ITripRequest[] }>('/trip-requests/my', cfg),

  getOpenRequests: (cfg?: any) =>
    axiosInstance.get<{ message: string; result: ITripRequest[] }>('/trip-requests/open', cfg),

  getById: (id: string, cfg?: any) =>
    axiosInstance.get<{ message: string; result: { request: ITripRequest, biddings: any[] } }>(`/trip-requests/${id}`, cfg)
}
