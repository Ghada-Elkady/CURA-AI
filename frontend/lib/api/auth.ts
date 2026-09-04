import { apiClient } from './client'

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export const authApi = {
  register: async (data: {
    email: string
    password: string
    full_name: string
    phone?: string
  }): Promise<LoginResponse> => {
    const res = await apiClient.post('/auth/register', { ...data, role: 'patient' })
    return res.data
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await apiClient.post('/auth/login', { email, password })
    return res.data
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const res = await apiClient.post('/auth/refresh', { refresh_token: refreshToken })
    return res.data
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email })
    return res.data
  },

  resetPassword: async (email: string, new_password: string) => {
    const res = await apiClient.post('/auth/reset-password', { email, new_password })
    return res.data
  },

  logout: async () => {
    await apiClient.post('/auth/logout')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },
}
