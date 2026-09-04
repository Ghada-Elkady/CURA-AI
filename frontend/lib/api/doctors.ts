import { apiClient } from './client'
import type { Doctor, Specialty, TimeSlot } from '@/lib/types'
import { MOCK_DOCTORS, MOCK_SPECIALTIES } from './mockData'

export const doctorsApi = {
  list: async (params?: {
    specialty_id?: string
    min_rating?: number
    gender?: string
    min_experience?: number
    max_fee?: number
    is_available_online?: boolean
    search?: string
    sort_by?: string
    skip?: number
    limit?: number
  }): Promise<Doctor[]> => {
    try {
      const res = await apiClient.get('/doctors', { params })
      if (Array.isArray(res.data) && res.data.length > 0) return res.data
    } catch (e) {
      console.warn('Backend API unavailable, using mock doctors dataset.')
    }
    
    let filtered = [...MOCK_DOCTORS]
    if (params?.specialty_id) {
      filtered = filtered.filter((d) => d.specialty?.id === params.specialty_id)
    }
    if (params?.search) {
      const q = params.search.toLowerCase()
      filtered = filtered.filter(
        (d) =>
          d.full_name?.toLowerCase().includes(q) ||
          d.specialty_name?.toLowerCase().includes(q) ||
          d.bio?.toLowerCase().includes(q)
      )
    }
    if (params?.min_rating) {
      filtered = filtered.filter((d) => d.rating_avg >= (params.min_rating || 0))
    }
    if (params?.max_fee) {
      filtered = filtered.filter((d) => d.consultation_fee <= (params.max_fee || 999))
    }
    return filtered
  },

  getById: async (id: string): Promise<Doctor> => {
    try {
      const res = await apiClient.get(`/doctors/${id}`)
      if (res.data) return res.data
    } catch (e) {
      console.warn('Backend API unavailable, using mock doctor details.')
    }
    return MOCK_DOCTORS.find((d) => d.id === id) || MOCK_DOCTORS[0]
  },

  getSpecialties: async (): Promise<Specialty[]> => {
    try {
      const res = await apiClient.get('/doctors/specialties')
      if (Array.isArray(res.data) && res.data.length > 0) return res.data
    } catch (e) {
      console.warn('Backend API unavailable, using mock specialties dataset.')
    }
    return MOCK_SPECIALTIES
  },

  getSlots: async (doctorId: string, date?: string): Promise<TimeSlot[]> => {
    try {
      const params = date ? { date } : {}
      const res = await apiClient.get(`/doctors/${doctorId}/slots`, { params })
      if (Array.isArray(res.data) && res.data.length > 0) return res.data
    } catch (e) {
      console.warn('Backend API unavailable, using generated mock time slots.')
    }
    // Generate realistic time slots
    const slots: TimeSlot[] = []
    const times = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM']
    times.forEach((t, index) => {
      slots.push({
        id: `slot-${index}`,
        doctor_id: doctorId,
        slot_datetime: t,
        duration_minutes: 30,
        is_booked: index === 1,
      })
    })
    return slots
  },

  getReviews: async (doctorId: string, skip = 0, limit = 10) => {
    try {
      const res = await apiClient.get(`/doctors/${doctorId}/reviews`, {
        params: { skip, limit },
      })
      if (res.data) return res.data
    } catch (e) {
      console.warn('Backend API unavailable, using mock reviews.')
    }
    return []
  },
}

