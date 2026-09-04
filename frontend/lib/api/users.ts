import { apiClient } from './client'
import type { User } from '@/lib/types'

export const usersApi = {
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/users/me')
    return res.data
  },

  updateMe: async (data: {
    full_name?: string
    phone?: string
    avatar_url?: string
  }): Promise<User> => {
    const res = await apiClient.put('/users/me', data)
    return res.data
  },
}
