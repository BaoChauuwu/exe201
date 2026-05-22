// Auth types
export interface LoginBody {
  email: string
  password: string
}

export interface RegisterBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
  role: 'tourist' | 'buddy'
}

export interface ForgotPasswordBody {
  email: string
}

export interface ResetPasswordBody {
  forgot_password_token: string
  password: string
  confirm_password: string
}

export interface AuthResult {
  access_token: string
  refresh_token: string
}

export interface AuthResponse {
  message: string
  result: AuthResult
}

export interface UserProfile {
  _id: string
  name: string
  email: string
  date_of_birth: string
  bio: string
  location: string
  website: string
  username: string
  avatar: string
  cover_photo: string
  verify: number
  role: 'tourist' | 'buddy' | 'admin'
}
