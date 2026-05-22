import { create } from 'zustand'
import type { UserProfile } from '../types/auth.types'
import { authApi } from '../api/auth.api'

interface AuthState {
  user: UserProfile | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean

  setTokens: (access_token: string, refresh_token: string) => void
  setUser: (user: UserProfile) => void
  logout: () => void
  initFromStorage: () => void
  fetchMe: () => Promise<void>
  updateProfile: (fields: Partial<UserProfile>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),

  setTokens: (access_token, refresh_token) => {
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    set({ accessToken: access_token, refreshToken: refresh_token, isAuthenticated: true })
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
  },

  initFromStorage: () => {
    const access_token = localStorage.getItem('access_token')
    const refresh_token = localStorage.getItem('refresh_token')
    set({
      accessToken: access_token,
      refreshToken: refresh_token,
      isAuthenticated: !!access_token
    })
  },

  fetchMe: async () => {
    try {
      const res = await authApi.getMe()
      set({ user: res.data.result })
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
    }
  },

  updateProfile: async (fields) => {
    const res = await authApi.updateMe(fields)
    set({ user: res.data.result })
  }
}))
