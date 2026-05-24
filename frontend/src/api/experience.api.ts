import axiosInstance from './axios'

/**
 * Interface đại diện cho cấu trúc dữ liệu của một Tour Trải nghiệm (Experience) 
 * nhận về từ Backend/Database.
 */
export interface IExperience {
  _id: string
  buddyId: string
  title: string
  description: string
  category: 'food' | 'adventure' | 'culture' | 'nightlife' | 'other'
  city: string
  price: number
  currency: string
  minHours: number
  maxGroupSize: number
  images: string[] // Cloudinary URLs
  includedItems: string[]
  meetingPoint: {
    type: 'Point'
    coordinates: [number, number] // GeoJSON [longitude, latitude]
  }
  isApproved: boolean
  isActive: boolean
  created_at: string
  updated_at: string
}

/**
 * Interface đại diện cho cấu trúc Form điền ở React Frontend (dùng react-hook-form/Zod).
 * Thiết kế phẳng và kiểu dữ liệu trực quan giúp việc binding UI mượt mà hơn.
 */
export interface ExperienceFormValues {
  title: string
  description: string
  category: 'food' | 'adventure' | 'culture' | 'nightlife' | 'other'
  city?: string
  currency?: string
  minHours: number
  maxGroupSize: number
  includedItems: string[]
  images: (File | string)[] // Kết hợp File mới upload và URL ảnh cũ đã có trên Cloudinary
  meetingPoint: {
    longitude: number
    latitude: number
  }
}

/**
 * Chuyển đổi dữ liệu Form của React thành FormData (Multipart Form-Data) để gửi lên server.
 * Tương thích cao với Multer và các bộ xử lý dữ liệu ở Backend.
 */
const buildFormData = (data: ExperienceFormValues): FormData => {
  const formData = new FormData()

  formData.append('title', data.title)
  formData.append('description', data.description)
  formData.append('category', data.category)
  formData.append('minHours', String(data.minHours))
  formData.append('maxGroupSize', String(data.maxGroupSize))
  formData.append('meetingPointLng', String(data.meetingPoint.longitude))
  formData.append('meetingPointLat', String(data.meetingPoint.latitude))

  if (data.city) formData.append('city', data.city)
  if (data.currency) formData.append('currency', data.currency)

  // Append includedItems với duy nhất 1 key 'includedItems'
  data.includedItems.forEach((item) => {
    formData.append('includedItems', item)
  })

  // Append File ảnh mới vào 'images', URL ảnh cũ cần giữ lại vào 'keepImages'
  data.images.forEach((img) => {
    if (img instanceof File) {
      formData.append('images', img)
    } else if (typeof img === 'string') {
      formData.append('keepImages', img)
    }
  })

  return formData
}

export const experienceApi = {
  /**
   * Tạo tour trải nghiệm mới
   */
  create: (data: ExperienceFormValues) =>
    axiosInstance.post<{ message: string; result: IExperience }>(
      '/experiences',
      buildFormData(data),
      {
        headers: {
          'Content-Type': undefined // Trình duyệt tự xác định boundary cho Multipart Form-Data
        }
      }
    ),

  /**
   * Cập nhật thông tin tour cũ
   */
  update: (id: string, data: ExperienceFormValues) =>
    axiosInstance.put<{ message: string; result: IExperience }>(
      `/experiences/${id}`,
      buildFormData(data),
      {
        headers: {
          'Content-Type': undefined
        }
      }
    ),

  /**
   * Lấy danh sách tour do chính Buddy hiện tại quản lý
   */
  getMyExperiences: () =>
    axiosInstance.get<{ message: string; result: IExperience[] }>('/experiences/my'),

  /**
   * Lấy chi tiết 1 tour theo ID
   */
  getById: (id: string) =>
    axiosInstance.get<{ message: string; result: IExperience }>(`/experiences/${id}`),

  /**
   * Lấy toàn bộ các tour đã được duyệt & active ra trang chủ (Public)
   */
  getAllPublic: () =>
    axiosInstance.get<{ message: string; result: IExperience[] }>('/experiences'),

  /**
   * Lấy danh sách danh mục lưu trong DB (Động)
   */
  getCategories: () =>
    axiosInstance.get<{ message: string; result: any[] }>('/categories'),

  /**
   * [ADMIN] Lấy danh sách các tour đang chờ duyệt
   */
  getPending: (cfg?: any) =>
    axiosInstance.get<{ data: IExperience[] }>('/admin/experiences/pending', cfg),

  /**
   * [ADMIN] Phê duyệt hoặc Từ chối tour
   */
  approveExperience: (experienceId: string, status: 'approved' | 'rejected', cfg?: any) =>
    axiosInstance.post<{ message: string }>('/admin/experiences/approve', { experienceId, status }, cfg),
}
