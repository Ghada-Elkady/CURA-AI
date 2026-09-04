import { apiClient } from './client'
import type { Review } from '@/lib/types'

export const reviewsApi = {
  create: async (data: {
    appointment_id: string
    rating: number
    comment?: string
  }): Promise<Review> => {
    const res = await apiClient.post('/reviews', data)
    return res.data
  },

  getDoctorReviews: async (doctorId: string, skip = 0, limit = 10): Promise<Review[]> => {
    const res = await apiClient.get(`/reviews/doctor/${doctorId}`, {
      params: { skip, limit },
    })
    return res.data
  },
}
