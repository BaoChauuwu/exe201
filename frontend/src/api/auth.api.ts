import axiosInstance from './axios'
import type {
  LoginBody,
  RegisterBody,
  ForgotPasswordBody,
  ResetPasswordBody,
  AuthResponse,
  UserProfile
} from '../types/auth.types'

export const authApi = {
  login: (body: LoginBody) =>
    axiosInstance.post<AuthResponse>('/users/login', body),

  register: (body: RegisterBody) =>
    axiosInstance.post<AuthResponse>('/users/register', body),

  logout: (refresh_token: string) =>
    axiosInstance.post('/users/logout', { refresh_token }),

  verifyEmail: (email_verify_token: string) =>
    axiosInstance.post('/users/verify-email', { email_verify_token }),

  resendEmailVerify: () =>
    axiosInstance.post('/users/resend-email-verify'),

  forgotPassword: (body: ForgotPasswordBody) =>
    axiosInstance.post('/users/forgot-password', body),

  verifyForgotPasswordToken: (forgot_password_token: string) =>
    axiosInstance.post('/users/verify-forgot-password-token', { forgot_password_token }),

  resetPassword: (body: ResetPasswordBody) =>
    axiosInstance.post('/users/reset-password', body),

  getMe: () =>
    axiosInstance.get<{ message: string; result: UserProfile }>('/users/me'),

  updateMe: (body: Partial<UserProfile>) =>
    axiosInstance.patch<{ message: string; result: UserProfile }>('/users/me', body),

  // Google OAuth — redirect trực tiếp tới backend
  loginWithGoogle: () => {
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : '/api'
    window.location.href = `${baseUrl}/users/google`
  }
}
