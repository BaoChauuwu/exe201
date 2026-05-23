export interface CreateExperienceRequestBody {
  title: string
  description: string
  category: string
  city?: string
  price: number
  currency?: string
  minHours?: number
  maxGroupSize?: number
  includedItems?: string | string[]
  'includedItems[]'?: string | string[]
  meetingPointLng: number
  meetingPointLat: number
}

export interface UpdateExperienceRequestBody {
  title?: string
  description?: string
  category?: string
  city?: string
  price?: number
  currency?: string
  minHours?: number
  maxGroupSize?: number
  includedItems?: string | string[]
  'includedItems[]'?: string | string[]
  meetingPointLng?: number
  meetingPointLat?: number
  isActive?: boolean
  keepImages?: string | string[]
  'keepImages[]'?: string | string[]
}
