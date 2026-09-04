import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/lib/types'
import { MOCK_USER } from '@/lib/api/mockData'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  login: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  setUser: (user: User) => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: MOCK_USER,
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
      isLoading: false,

      login: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', accessToken)
          localStorage.setItem('refresh_token', refreshToken)
        }
        set({ user, accessToken, refreshToken })
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
        set({ user: null, accessToken: null, refreshToken: null })
      },

      setUser: (user) => set({ user }),

      initialize: () => {
        if (typeof window !== 'undefined') {
          const accessToken = localStorage.getItem('access_token')
          const refreshToken = localStorage.getItem('refresh_token')
          if (accessToken) {
            set({ accessToken, refreshToken })
          } else {
            set({ user: MOCK_USER, accessToken: 'demo-access-token', refreshToken: 'demo-refresh-token' })
          }
        }
      },
    }),
    {
      name: 'cura-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)

